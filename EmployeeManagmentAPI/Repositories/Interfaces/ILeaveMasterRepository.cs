using EmployeeManagmentAPI.Models;

namespace EmployeeManagmentAPI.Repositories.Interfaces
{
    public interface ILeaveMasterRepository
    {
        Task<IEnumerable<LeaveMaster>> GetAllLeaveMastersAsync();
        Task<LeaveMaster> GetLeaveMasterByIdAsync(int id);
        Task<LeaveMaster> AddLeaveMasterAsync(LeaveMaster leaveMaster);
        Task<LeaveMaster> UpdateLeaveMasterAsync(LeaveMaster leaveMaster);
        Task<bool> DeleteLeaveMasterAsync(int id);
    }
}
