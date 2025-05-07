using EmployeeManagmentAPI.DTOs;

namespace EmployeeManagmentAPI.Services.Interfaces
{
    public interface ILeaveMasterService
    {
        Task<IEnumerable<LeaveMasterDTO>> GetAllAsync();
        Task<LeaveMasterDTO?> GetByIdAsync(int id);
        Task<LeaveMasterDTO> CreateAsync(LeaveMasterUpsertDTO dto);
        Task<LeaveMasterDTO?> UpdateAsync(int id, LeaveMasterUpsertDTO dto);
        Task<bool> DeleteAsync(int id);
    }
}
