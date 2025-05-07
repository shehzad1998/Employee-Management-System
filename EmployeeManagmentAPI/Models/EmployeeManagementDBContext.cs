using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagmentAPI.Models
{
    public partial class EmployeeManagementDBContext : DbContext
    {
        public EmployeeManagementDBContext(DbContextOptions<EmployeeManagementDBContext> options)
            : base(options)
        {
        }

        public virtual DbSet<Department> Departments { get; set; }

        public virtual DbSet<Designation> Designations { get; set; }

        public virtual DbSet<Employee> Employees { get; set; }

        public virtual DbSet<Leave> Leaves { get; set; }
        public DbSet<LeaveBalance> LeaveBalances { get; set; }

        public virtual DbSet<LeaveMaster> LeaveMasters { get; set; }

        public virtual DbSet<Role> Roles { get; set; }

        public virtual DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Department>(entity =>
            {
                entity.HasKey(e => e.Id).HasName("PK__Departme__3214EC07AA4D869C");

                entity.HasIndex(e => e.Name, "UQ__Departme__737584F6005019B2").IsUnique();

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(100);
            });

            modelBuilder.Entity<Designation>(entity =>
            {
                entity.HasKey(e => e.Id).HasName("PK__Designat__3214EC0742A76793");

                entity.HasIndex(e => e.Title, "UQ__Designat__2CB664DCF3B7E9E3").IsUnique();

                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(100);
            });

            modelBuilder.Entity<Employee>(entity =>
            {
                entity.HasKey(e => e.Id).HasName("PK__Employee__3214EC070C1C224B");

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(100);
                entity.Property(e => e.Phone)
                    .IsRequired()
                    .HasMaxLength(15);

                entity.HasOne(d => d.Department).WithMany(p => p.Employees)
                    .HasForeignKey(d => d.DepartmentId)
                    .HasConstraintName("FK__Employees__Depar__6754599E");

                entity.HasOne(d => d.Designation).WithMany(p => p.Employees)
                    .HasForeignKey(d => d.DesignationId)
                    .HasConstraintName("FK__Employees__Desig__68487DD7");

                entity.HasOne(e => e.Manager)
                    .WithMany(m => m.Subordinates)
                    .HasForeignKey(e => e.ManagerId)
                    .OnDelete(DeleteBehavior.Restrict) // prevent cascade loop
                    .HasConstraintName("FK__Employees__ManagerId__6A30C649");
            });

            modelBuilder.Entity<Leave>(entity =>
            {
                entity.HasKey(e => e.Id).HasName("PK__Leaves__3214EC07B9387F7C");

                entity.Property(e => e.Status).HasMaxLength(50);

                entity.HasOne(d => d.Employee).WithMany(p => p.Leaves)
                    .HasForeignKey(d => d.EmployeeId)
                    .HasConstraintName("FK__Leaves__Employee__6D0D32F4");

                entity.HasOne(d => d.LeaveMaster).WithMany(p => p.Leaves)
                    .HasForeignKey(d => d.LeaveMasterId)
                    .HasConstraintName("FK_Leaves_LeaveMaster");
            });

            modelBuilder.Entity<LeaveBalance>()
                    .HasOne(lb => lb.Employee)
                    .WithMany()
                    .HasForeignKey(lb => lb.EmployeeId)
                    .OnDelete(DeleteBehavior.Cascade);  // Enabling cascade delete

            modelBuilder.Entity<LeaveBalance>()
                .HasOne(lb => lb.LeaveMaster)
                .WithMany()
                .HasForeignKey(lb => lb.LeaveMasterId);

            modelBuilder.Entity<LeaveBalance>()
                .Property(lb => lb.RemainingDays)
                .HasComputedColumnSql("[MaxAllowedDays] - [UsedDays]");

            modelBuilder.Entity<LeaveMaster>(entity =>
            {
                entity.HasKey(e => e.Id).HasName("PK__LeaveMas__3214EC078ED4EB7C");

                entity.ToTable("LeaveMaster");

                entity.HasIndex(e => e.LeaveType, "UQ__LeaveMas__B44505937F122BED").IsUnique();

                entity.Property(e => e.LeaveType)
                    .IsRequired()
                    .HasMaxLength(50);
            });

            modelBuilder.Entity<Role>(entity =>
            {
                entity.HasKey(e => e.Id).HasName("PK__Roles__3214EC07838A5307");

                entity.HasIndex(e => e.Name, "UQ__Roles__737584F69D6132A1").IsUnique();

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(50);
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id).HasName("PK__Users__3214EC075DB05FA2");

                entity.HasIndex(e => e.Username, "UQ__Users__536C85E42DC237B0").IsUnique();

                entity.HasIndex(e => e.Email, "UQ__Users__A9D10534D1E56850").IsUnique();

                entity.Property(e => e.Email)
                    .IsRequired()
                    .HasMaxLength(100);
                entity.Property(e => e.PasswordHash)
                    .IsRequired()
                    .HasMaxLength(255);
                entity.Property(e => e.Username)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.HasOne(d => d.Role).WithMany(p => p.Users)
                    .HasForeignKey(d => d.RoleId)
                    .HasConstraintName("FK__Users__RoleId__4E88ABD4");
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
