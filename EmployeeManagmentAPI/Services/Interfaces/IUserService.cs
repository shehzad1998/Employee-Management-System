using EmployeeManagmentAPI.DTOs;

namespace EmployeeManagmentAPI.Services.Interfaces
{
    using EmployeeManagmentAPI.DTOs;

    public interface IUserService : IGenericService<USerDTO>
    {
        Task<bool> UpdatePasswordAsync(UpdatePasswordDTO dto);
    }

}
