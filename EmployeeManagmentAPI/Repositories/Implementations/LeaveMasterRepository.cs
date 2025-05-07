using EmployeeManagmentAPI.Models;
using EmployeeManagmentAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagmentAPI.Repositories.Implementations
{
    public class LeaveMasterRepository : ILeaveMasterRepository
    {
        private readonly EmployeeManagementDBContext _context;

        public LeaveMasterRepository(EmployeeManagementDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<LeaveMaster>> GetAllLeaveMastersAsync()
        {
            return await _context.LeaveMasters.ToListAsync();
        }

        public async Task<LeaveMaster> GetLeaveMasterByIdAsync(int id)
        {
            return await _context.LeaveMasters.FindAsync(id);
        }

        public async Task<LeaveMaster> AddLeaveMasterAsync(LeaveMaster leaveMaster)
        {
            _context.LeaveMasters.Add(leaveMaster);
            await _context.SaveChangesAsync();
            return leaveMaster;
        }

        public async Task<LeaveMaster> UpdateLeaveMasterAsync(LeaveMaster leaveMaster)
        {
            _context.LeaveMasters.Update(leaveMaster);
            await _context.SaveChangesAsync();
            return leaveMaster;
        }

        public async Task<bool> DeleteLeaveMasterAsync(int id)
        {
            var leaveMaster = await _context.LeaveMasters.FindAsync(id);
            if (leaveMaster == null) return false;

            _context.LeaveMasters.Remove(leaveMaster);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
