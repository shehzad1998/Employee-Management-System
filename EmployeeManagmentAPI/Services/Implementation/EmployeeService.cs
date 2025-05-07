using AutoMapper;
using EmployeeManagmentAPI.DTOs;
using EmployeeManagmentAPI.Models;
using EmployeeManagmentAPI.Repositories.Interfaces;
using EmployeeManagmentAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace EmployeeManagmentAPI.Services.Implementation
{
    public class EmployeeService : IEmployeeService
    {
        private readonly IEmployeeRepository _employeeRepo;
        private readonly ILeaveMasterRepository _leaveMasterRepository;
        private readonly ILeaveBalanceRepository _leaveBalanceRepository;
        private readonly IMapper _mapper;
        private readonly EmployeeManagementDBContext _context;

        public EmployeeService(
           IEmployeeRepository employeeRepo,
           ILeaveMasterRepository leaveMasterRepository,
           ILeaveBalanceRepository leaveBalanceRepository,
           EmployeeManagementDBContext context,
           IMapper mapper)
        {
            _employeeRepo = employeeRepo;
            _leaveMasterRepository = leaveMasterRepository;
            _leaveBalanceRepository = leaveBalanceRepository;
            _context = context;
            _mapper = mapper;
        }

        private string HashPassword(string password)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        public async Task<IEnumerable<EmployeesDTO>> GetAllEmployeesAsync()
        {
            var employees = await _employeeRepo.GetAllAsync();

            // Initial DTO mapping
            var employeeDtos = _mapper.Map<List<EmployeesDTO>>(employees);

            // Populate ManagerName using the mapped employees
            foreach (var dto in employeeDtos)
            {
                if (int.TryParse(dto.ManagerId, out int managerId))
                {
                    var manager = employees.FirstOrDefault(e => e.Id == managerId);
                    dto.ManagerName = manager?.Name;
                }
            }

            return employeeDtos;
        }


        public async Task<EmployeesDTO> GetEmployeeByIdAsync(int id)
        {
            var employee = await _context.Employees
                                         .Include(e => e.Department)
                                         .Include(e => e.Designation)
                                         .Include(e => e.User)
                                         .FirstOrDefaultAsync(e => e.Id == id);

            if (employee == null)
                return null;

            return _mapper.Map<EmployeesDTO>(employee);
        }

        public async Task<EmployeesDTO> AddEmployeeAsync(EmployeeCreateUpdateDTO employeeDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Check if user already exists
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == employeeDto.User.Email);

                if (existingUser != null)
                {
                    throw new Exception("A user with this email already exists.");
                }

                // Hash password
                string passwordHash = HashPassword(employeeDto.User.Password);

                // Create User
                var user = new User
                {
                    Email = employeeDto.User.Email,
                    PasswordHash = passwordHash,
                    RoleId = employeeDto.User.RoleId,
                    Username = employeeDto.User.Username
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync(); // Save to generate ID

                // Create Employee
                var employee = new Employee
                {
                    Name = employeeDto.Name,
                    Phone = employeeDto.Phone,
                    DepartmentId = employeeDto.DepartmentId,
                    DesignationId = employeeDto.DesignationId,
                    UserId = user.Id,
                    ManagerId = employeeDto.ManagerId  // <-- ADD THIS
                };
                _context.Employees.Add(employee);
                await _context.SaveChangesAsync();

                // Fetch all leave types
                var leaveTypes = await _leaveMasterRepository.GetAllLeaveMastersAsync();

                foreach (var leaveType in leaveTypes)
                {
                    var balance = new LeaveBalance
                    {
                        EmployeeId = employee.Id,
                        LeaveMasterId = leaveType.Id,
                        TotalDays = leaveType.MaxDays,
                        UsedDays = 0
                    };
                    await _leaveBalanceRepository.AddLeaveBalanceAsync(balance);
                }

                await transaction.CommitAsync();

                // Load related entities
                await _context.Entry(employee).Reference(e => e.Department).LoadAsync();
                await _context.Entry(employee).Reference(e => e.Designation).LoadAsync();
                await _context.Entry(employee).Reference(e => e.User).LoadAsync();

                return _mapper.Map<EmployeesDTO>(employee);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<EmployeesDTO?> UpdateEmployeeAsync(int id, EmployeeCreateUpdateDTO employeeDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var employee = await _context.Employees
                    .Include(e => e.User)
                    .FirstOrDefaultAsync(e => e.Id == id);

                if (employee == null)
                    return null;

                // Update employee info
                employee.Name = employeeDto.Name;
                employee.Phone = employeeDto.Phone;
                employee.DepartmentId = employeeDto.DepartmentId;
                employee.DesignationId = employeeDto.DesignationId;
                employee.ManagerId = employeeDto.ManagerId;  // Add this line

                // Update user info
                if (employee.User != null)
                {
                    employee.User.Username = employeeDto.User.Username;
                    employee.User.Email = employeeDto.User.Email;
                    employee.User.RoleId = employeeDto.User.RoleId;  // Add this line

                    if (!string.IsNullOrWhiteSpace(employeeDto.User.Password))
                    {
                        employee.User.PasswordHash = HashPassword(employeeDto.User.Password);
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Reload navigation properties
                await _context.Entry(employee).Reference(e => e.Department).LoadAsync();
                await _context.Entry(employee).Reference(e => e.Designation).LoadAsync();
                await _context.Entry(employee).Reference(e => e.User).Query()
                    .Include(u => u.Role)  // Add this to include role information
                    .LoadAsync();

                return _mapper.Map<EmployeesDTO>(employee);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> DeleteEmployeeAsync(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var employee = await _context.Employees
                    .Include(e => e.User)
                    .FirstOrDefaultAsync(e => e.Id == id);

                if (employee == null)
                    return false;

                // Delete dependent entities first
                var leaveBalances = await _context.LeaveBalances
                    .Where(lb => lb.EmployeeId == id)
                    .ToListAsync();
                _context.LeaveBalances.RemoveRange(leaveBalances);

                var leaves = await _context.Leaves
                    .Where(l => l.EmployeeId == id)
                    .ToListAsync();
                _context.Leaves.RemoveRange(leaves);

                // Delete user if exists
                if (employee.User != null)
                {
                    _context.Users.Remove(employee.User);
                }

                // Delete employee
                _context.Employees.Remove(employee);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
