using AutoMapper;
using EmployeeManagmentAPI.DTOs;
using EmployeeManagmentAPI.Models;
using EmployeeManagmentAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagmentAPI.Repositories.Implementations
{
    public class LeaveBalanceRepository : ILeaveBalanceRepository
    {
        private readonly EmployeeManagementDBContext _context;
        private readonly IMapper _mapper;

        public LeaveBalanceRepository(EmployeeManagementDBContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<LeaveBalance?> GetLeaveBalanceAsync(int employeeId, int leaveMasterId)
        {
            return await _context.LeaveBalances
                .Include(lb => lb.Employee)
                .Include(lb => lb.LeaveMaster)
                .FirstOrDefaultAsync(lb => lb.EmployeeId == employeeId && lb.LeaveMasterId == leaveMasterId);
        }



        public async Task<IEnumerable<LeaveBalanceDTO>> GetLeaveBalancesByEmployeeAsync(int employeeId)
        {
            var leaveBalances = await _context.LeaveBalances
                .Include(lb => lb.Employee)           // 👈 include related data
                .Include(lb => lb.LeaveMaster)        // 👈 include related data
                .Where(lb => lb.EmployeeId == employeeId)
                .ToListAsync();

            return _mapper.Map<IEnumerable<LeaveBalanceDTO>>(leaveBalances);
        }


        public async Task UpdateLeaveBalanceAsync(LeaveBalance leaveBalance)
        {
            var existing = await _context.LeaveBalances
                .FirstOrDefaultAsync(lb => lb.EmployeeId == leaveBalance.EmployeeId &&
                                           lb.LeaveMasterId == leaveBalance.LeaveMasterId);

            if (existing != null)
            {
                existing.UsedDays = leaveBalance.UsedDays;

                // ❌ Do NOT touch RemainingDays (it's computed)

                await _context.SaveChangesAsync();
            }
        }

        public async Task<LeaveBalance> AddLeaveBalanceAsync(LeaveBalance leaveBalance)
        {
            _context.LeaveBalances.Add(leaveBalance);
            await _context.SaveChangesAsync();
            return leaveBalance;
        }

    
    }
}
