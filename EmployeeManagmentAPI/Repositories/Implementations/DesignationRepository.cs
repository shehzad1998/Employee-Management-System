using EmployeeManagmentAPI.Models;
using EmployeeManagmentAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagmentAPI.Repositories.Implementations
{
    public class DesignationRepository : IDesignationRepository
    {
        private readonly EmployeeManagementDBContext _context;

        public DesignationRepository(EmployeeManagementDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Designation>> GetAllDesignationsAsync()
        {
            return await _context.Designations.ToListAsync();
        }

        public async Task<Designation?> GetDesignationByIdAsync(int id)
        {
            return await _context.Designations.FindAsync(id);
        }

        public async Task<Designation> AddDesignationAsync(Designation designation)
        {
            _context.Designations.Add(designation);
            await _context.SaveChangesAsync();
            return designation;
        }

        public async Task<Designation?> UpdateDesignationAsync(Designation designation)
        {
            var existing = await _context.Designations.FindAsync(designation.Id);
            if (existing == null) return null;

            existing.Title = designation.Title;
            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteDesignationAsync(int id)
        {
            var designation = await _context.Designations.FindAsync(id);
            if (designation == null) return false;

            _context.Designations.Remove(designation);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
