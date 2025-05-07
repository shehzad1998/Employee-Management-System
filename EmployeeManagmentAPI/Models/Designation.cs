using System;
using System.Collections.Generic;

namespace EmployeeManagmentAPI.Models;

public partial class Designation
{
    public int Id { get; set; }

    public string Title { get; set; }

    public virtual ICollection<Employee> Employees { get; set; } = new List<Employee>();
}
