using EmployeeManagmentAPI.Enums;

namespace EmployeeManagmentAPI.Models;

public partial class Leave
{
    public int Id { get; set; }

    public int EmployeeId { get; set; }

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    public LeaveStatus Status { get; set; } = LeaveStatus.Pending;

    public int? LeaveMasterId { get; set; }

    public virtual Employee Employee { get; set; }

    public virtual LeaveMaster LeaveMaster { get; set; }
}
