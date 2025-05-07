using EmployeeManagmentAPI.Models;
using EmployeeManagmentAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagmentAPI.Repositories.Implementations
{
    public class LeaveRepository : ILeaveRepository
    {
        private readonly EmployeeManagementDBContext _context;

        public LeaveRepository(EmployeeManagementDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Leave>> GetAllLeavesAsync()
        {
            return await _context.Leaves
                .Include(l => l.Employee)
                .Include(l => l.LeaveMaster)
                .ToListAsync();
        }
        public async Task<Leave?> GetLeaveByIdAsync(int id)
        {
            return await _context.Leaves
                .Include(l => l.Employee)
                .Include(l => l.LeaveMaster)
                .FirstOrDefaultAsync(l => l.Id == id);
        }

        public async Task<IEnumerable<Leave>> GetLeavesByEmployeeIdAsync(int employeeId)
        {
            Console.WriteLine($"LeaveRepository.GetLeavesByEmployeeIdAsync called with employeeId: {employeeId}");
            var leaves = await _context.Leaves
                .Include(l => l.Employee)
                .Include(l => l.LeaveMaster)
                .Where(l => l.EmployeeId == employeeId)
                .ToListAsync();
            Console.WriteLine($"LeaveRepository.GetLeavesByEmployeeIdAsync found {leaves.Count} leaves");
            return leaves;
        }

        public async Task<Leave> AddLeaveAsync(Leave leave)
        {
            _context.Leaves.Add(leave);
            await _context.SaveChangesAsync();
            return leave;
        }

        public async Task<Leave> UpdateLeaveAsync(Leave leave)
        {
            _context.Leaves.Update(leave);
            await _context.SaveChangesAsync();
            return leave;
        }

        public async Task<bool> DeleteLeaveAsync(int id)
        {
            var leave = await _context.Leaves.FindAsync(id);
            if (leave == null) return false;

            _context.Leaves.Remove(leave);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> IsUserAdminAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            return user != null && user.Role.Name == "Admin"; // or RoleId == 1 if you use RoleId
        }

    }
}
