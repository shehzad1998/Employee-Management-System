using System;
using System.Collections.Generic;

namespace EmployeeManagmentAPI.Models;

public partial class User
{
    public int Id { get; set; }

    public string Username { get; set; }

    public string Email { get; set; }

    public string PasswordHash { get; set; }

    public int RoleId { get; set; }

    public Employee Employee { get; set; }  // Navigation property
    public virtual Role Role { get; set; }
}
