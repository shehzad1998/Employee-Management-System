using EmployeeManagmentAPI.DTOs;
using EmployeeManagmentAPI.Models;

namespace EmployeeManagmentAPI.Repositories.Interfaces
{
    public interface IUserRepository
    {
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<User?> GetUserByIdAsync(int id);
        Task<User> AddUserAsync(User user);
        Task<User?> UpdateUserAsync(User user);
        Task<bool> DeleteUserAsync(int id);
        Task<bool> IsUserAdminAsync(int userId);
        Task<bool> UpdatePasswordAsync(UpdatePasswordDTO dto);


    }
}
