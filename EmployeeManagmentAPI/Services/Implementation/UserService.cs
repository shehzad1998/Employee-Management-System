using AutoMapper;
using EmployeeManagmentAPI.DTOs;
using EmployeeManagmentAPI.Models;
using EmployeeManagmentAPI.Repositories.Interfaces;
using EmployeeManagmentAPI.Services.Interfaces;
using System.Security.Cryptography;
using System.Text;

namespace EmployeeManagmentAPI.Services.Implementation
{
    public class UserService : GenericService<User, USerDTO>, IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(
            IGenericRepository<User> genericRepository,
            IUserRepository userRepository,
            IMapper mapper
        ) : base(genericRepository, mapper)
        {
            _userRepository = userRepository;
        }

        public async Task<bool> UpdatePasswordAsync(UpdatePasswordDTO dto)
        {
            // Fetch user
            var user = await _userRepository.GetUserByIdAsync(dto.UserId);
            if (user == null) return false;

            // Verify old password
            using var sha = SHA256.Create();
            var oldPasswordHash = Convert.ToBase64String(sha.ComputeHash(Encoding.UTF8.GetBytes(dto.OldPassword)));
            if (user.PasswordHash != oldPasswordHash)
                return false;

            // Hash new password and update
            var newPasswordHash = Convert.ToBase64String(sha.ComputeHash(Encoding.UTF8.GetBytes(dto.NewPassword)));
            user.PasswordHash = newPasswordHash;

            await _userRepository.UpdateUserAsync(user);
            return true;
        }
    }


}
