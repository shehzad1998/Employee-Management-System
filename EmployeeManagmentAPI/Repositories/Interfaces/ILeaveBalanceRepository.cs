using EmployeeManagmentAPI.DTOs;
using EmployeeManagmentAPI.Models;

namespace EmployeeManagmentAPI.Repositories.Interfaces
{
    public interface ILeaveBalanceRepository
    {
        Task<LeaveBalance?> GetLeaveBalanceAsync(int employeeId, int leaveMasterId);
        Task<IEnumerable<LeaveBalanceDTO>> GetLeaveBalancesByEmployeeAsync(int employeeId);
        Task UpdateLeaveBalanceAsync(LeaveBalance leaveBalance);
        Task<LeaveBalance> AddLeaveBalanceAsync(LeaveBalance leaveBalance);

    }
}
