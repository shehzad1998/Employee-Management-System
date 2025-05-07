using EmployeeManagmentAPI.Models;

namespace EmployeeManagmentAPI.Repositories.Interfaces
{
    public interface IRoleRepository
    {
        Task<IEnumerable<Role>> GetAllRolesAsync();
        Task<Role?> GetRoleByIdAsync(int id);
        Task<Role> AddRoleAsync(Role role);
        Task<Role?> UpdateRoleAsync(Role role);
        Task<bool> DeleteRoleAsync(int id);
    }
}
