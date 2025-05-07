using EmployeeManagmentAPI.DTOs;

namespace EmployeeManagmentAPI.Services.Interfaces
{
    public interface ILeaveService
    {
        Task<IEnumerable<LeaveDTO>> GetAllAsync();
        Task<LeaveDTO?> GetLeaveByIdAsync(int id);

        Task<IEnumerable<LeaveDTO>> GetByIdAsync(int EmployeeId);
        Task<LeaveDTO> ApplyLeaveAsync(LeaveApplyDTO dto); // Create
        Task<LeaveDTO?> UpdateLeaveAsync(int id, LeaveApplyDTO dto); // Update
        Task<bool> DeleteAsync(int id);
        Task<bool> ApproveLeaveAsync(int leaveId);  
        Task<bool> RejectLeaveAsync(int leaveId);

    }
}
