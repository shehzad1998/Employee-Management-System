using AutoMapper;
using EmployeeManagmentAPI.DTOs;
using EmployeeManagmentAPI.Enums;
using EmployeeManagmentAPI.Models;
using EmployeeManagmentAPI.Repositories.Interfaces;
using EmployeeManagmentAPI.Services.Interfaces;

namespace EmployeeManagmentAPI.Services.Implementation
{
    public class LeaveService : ILeaveService
    {
        private readonly ILeaveRepository _repository;
        private readonly ILeaveBalanceRepository _balanceRepository;
        private readonly IMapper _mapper;
        private readonly IUserContextService _userContext;
        private readonly IUserRepository _userRepository;



        public LeaveService(
            ILeaveRepository repository,
            ILeaveBalanceRepository balanceRepository,
            IMapper mapper,
            IUserContextService userContext,
            IUserRepository userRepository)
        {
            _repository = repository;
            _balanceRepository = balanceRepository;
            _mapper = mapper;
            _userContext = userContext;
            _userRepository = userRepository;
        }

        public async Task<IEnumerable<LeaveDTO>> GetAllAsync()
        {
            var leaves = await _repository.GetAllLeavesAsync();
            return _mapper.Map<IEnumerable<LeaveDTO>>(leaves);
        }
        public async Task<LeaveDTO?> GetLeaveByIdAsync(int id)
        {
            var leave = await _repository.GetLeaveByIdAsync(id);
            return leave == null ? null : _mapper.Map<LeaveDTO>(leave);
        }

        public async Task<IEnumerable<LeaveDTO>> GetByIdAsync(int employeeId)
        {
            Console.WriteLine($"LeaveService.GetByIdAsync called with employeeId: {employeeId}");
            var leaves = await _repository.GetLeavesByEmployeeIdAsync(employeeId);
            Console.WriteLine($"LeaveService.GetByIdAsync found {leaves.Count()} leaves");
            return _mapper.Map<IEnumerable<LeaveDTO>>(leaves);
        }


        public async Task<LeaveDTO> ApplyLeaveAsync(LeaveApplyDTO dto)
        {
            // Step 1: Calculate requested days
            int requestedDays = dto.EndDate.DayNumber - dto.StartDate.DayNumber + 1;
            if (requestedDays <= 0)
            {
                throw new Exception("Invalid leave duration.");
            }

            // Step 2: Get leave balance
            var leaveBalance = await _balanceRepository.GetLeaveBalanceAsync(dto.EmployeeId, dto.LeaveMasterId);

            // ✅ Auto-create LeaveBalance if not found
            if (leaveBalance == null)
            {
                // Optional: You can fetch default days from LeaveMaster if needed
                leaveBalance = new LeaveBalance
                {
                    EmployeeId = dto.EmployeeId,
                    LeaveMasterId = dto.LeaveMasterId,
                    TotalDays = 20, // You can fetch this from LeaveMaster or use config
                    UsedDays = 0
                };

                leaveBalance = await _balanceRepository.AddLeaveBalanceAsync(leaveBalance);
            }

            // Step 3: Check if sufficient leave is available
            int remainingDays = leaveBalance.TotalDays - leaveBalance.UsedDays;
            if (remainingDays < requestedDays)
            {
                throw new Exception("Insufficient leave balance.");
            }

            // Step 4: Create the leave (Pending status)
            var leave = new Leave
            {
                EmployeeId = dto.EmployeeId,
                LeaveMasterId = dto.LeaveMasterId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Status = (byte)LeaveStatus.Pending
            };

            var createdLeave = await _repository.AddLeaveAsync(leave);

            // Step 5: Fetch with navigation properties (Employee & LeaveMaster)
            var leaveWithIncludes = await _repository.GetLeaveByIdAsync(createdLeave.Id);
            return _mapper.Map<LeaveDTO>(leaveWithIncludes);
        }


        public async Task<LeaveDTO?> UpdateLeaveAsync(int id, LeaveApplyDTO dto)
        {
            var existing = await _repository.GetLeaveByIdAsync(id);
            if (existing == null) return null;

            _mapper.Map(dto, existing);
            var updated = await _repository.UpdateLeaveAsync(existing);
            return _mapper.Map<LeaveDTO>(updated);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _repository.DeleteLeaveAsync(id);
        }

        public async Task<bool> ApproveLeaveAsync(int leaveId)
        {
            var leave = await _repository.GetLeaveByIdAsync(leaveId);
            if (leave == null || leave.Status == LeaveStatus.Approved)
                return false;

            var employee = leave.Employee;
            if (employee == null)
                throw new Exception("Employee not found.");

            // Get the approver's EMPLOYEE ID (renamed for clarity)
            int approverEmployeeId = _userContext.GetEmployeeId();

            // Authorization check (now using employee IDs)
            if (employee.ManagerId != approverEmployeeId && !await _userRepository.IsUserAdminAsync(approverEmployeeId))
                throw new UnauthorizedAccessException("Not authorized to approve this leave.");

            // Removed leave balance calculation logic

            // Update leave status
            leave.Status = LeaveStatus.Approved;
            await _repository.UpdateLeaveAsync(leave);

            return true;
        }

        public async Task<bool> RejectLeaveAsync(int leaveId)
        {
            var leave = await _repository.GetLeaveByIdAsync(leaveId);
            if (leave == null || leave.Status == LeaveStatus.Rejected)
                return false;

            var employee = leave.Employee;
            if (employee == null)
                throw new Exception("Employee not found.");

            int approverUserId = _userContext.GetEmployeeId();

            // Check if the user is authorized to reject
            if (employee.ManagerId != approverUserId && !await _userRepository.IsUserAdminAsync(approverUserId))
                throw new UnauthorizedAccessException("Not authorized to reject this leave.");

            if (leave.Status == LeaveStatus.Approved)
            {
                int requestedDays = leave.EndDate.DayNumber - leave.StartDate.DayNumber + 1;
                var leaveBalance = await _balanceRepository.GetLeaveBalanceAsync(leave.EmployeeId, leave.LeaveMasterId ?? 0);
                if (leaveBalance != null)
                {
                    leaveBalance.UsedDays -= requestedDays;
                    if (leaveBalance.UsedDays < 0) leaveBalance.UsedDays = 0;

                    await _balanceRepository.UpdateLeaveBalanceAsync(leaveBalance);
                }
            }

            leave.Status = LeaveStatus.Rejected;
            await _repository.UpdateLeaveAsync(leave);
            return true;
        }



    }
}
