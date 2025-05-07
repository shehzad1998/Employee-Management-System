using EmployeeManagmentAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagmentAPI.Services.Implementation
{
    public class LeaveBalanceSeeder
    {
        private readonly EmployeeManagementDBContext _context;

        public LeaveBalanceSeeder(EmployeeManagementDBContext context)
        {
            _context = context;
        }

        public async Task SeedAsync()
        {
            var employees = await _context.Employees.ToListAsync();
            var leaveTypes = await _context.LeaveMasters.ToListAsync();

            foreach (var employee in employees)
            {
                foreach (var leaveType in leaveTypes)
                {
                    var exists = await _context.LeaveBalances
                        .AnyAsync(lb => lb.EmployeeId == employee.Id && lb.LeaveMasterId == leaveType.Id);

                    if (!exists)
                    {
                        var balance = new LeaveBalance
                        {
                            EmployeeId = employee.Id,
                            LeaveMasterId = leaveType.Id,
                            TotalDays = leaveType.MaxDays, // Default from LeaveMaster
                            UsedDays = 0
                        };

                        _context.LeaveBalances.Add(balance);
                    }
                }
            }

            await _context.SaveChangesAsync();
        }
    }
}
