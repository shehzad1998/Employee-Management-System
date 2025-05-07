using EmployeeManagmentAPI.Models;
using EmployeeManagmentAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagmentAPI.Repositories.Implementations
{
    public class RoleRepository : IRoleRepository
    {
        private readonly EmployeeManagementDBContext _context;

        public RoleRepository(EmployeeManagementDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Role>> GetAllRolesAsync()
        {
            return await _context.Roles.ToListAsync();
        }

        public async Task<Role?> GetRoleByIdAsync(int id)
        {
            return await _context.Roles.FindAsync(id);
        }

        public async Task<Role> AddRoleAsync(Role role)
        {
            _context.Roles.Add(role);
            await _context.SaveChangesAsync();
            return role;
        }

        public async Task<Role?> UpdateRoleAsync(Role role)
        {
            var existing = await _context.Roles.FindAsync(role.Id);
            if (existing == null) return null;

            existing.Name = role.Name;
            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteRoleAsync(int id)
        {
            var role = await _context.Roles.FindAsync(id);
            if (role == null) return false;

            _context.Roles.Remove(role);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
