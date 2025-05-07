using System;
using System.Collections.Generic;

namespace EmployeeManagmentAPI.Models;

public partial class LeaveMaster
{
    public int Id { get; set; }

    public string LeaveType { get; set; }

    public int MaxDays { get; set; }

    public virtual ICollection<Leave> Leaves { get; set; } = new List<Leave>();
}
