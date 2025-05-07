using EmployeeManagmentAPI.Models;

namespace EmployeeManagmentAPI.Repositories.Interfaces
{
    public interface ILeaveRepository
    {
        Task<IEnumerable<Leave>> GetAllLeavesAsync();
        Task<Leave?> GetLeaveByIdAsync(int id);

        Task<IEnumerable<Leave>> GetLeavesByEmployeeIdAsync(int EmployeeId);
        Task<Leave> AddLeaveAsync(Leave leave);
        Task<Leave> UpdateLeaveAsync(Leave leave);
        Task<bool> DeleteLeaveAsync(int id);




    }
}
