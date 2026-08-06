using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace ScoreSeer.Api.Models;

public partial class ScoreSeerDbContext : DbContext
{
    public ScoreSeerDbContext()
    {
    }

    public ScoreSeerDbContext(DbContextOptions<ScoreSeerDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Group> Groups { get; set; }

    public virtual DbSet<GroupMember> GroupMembers { get; set; }

    public virtual DbSet<Invitation> Invitations { get; set; }

    public virtual DbSet<League> Leagues { get; set; }

    public virtual DbSet<Match> Matches { get; set; }

    public virtual DbSet<Prediction> Predictions { get; set; }

    public virtual DbSet<Team> Teams { get; set; }

    public virtual DbSet<User> Users { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Group>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("groups_pkey");

            entity.ToTable("groups");

            entity.HasIndex(e => e.InviteCode, "groups_invite_code_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            entity.Property(e => e.InviteCode)
                .HasMaxLength(20)
                .HasColumnName("invite_code");
            entity.Property(e => e.Name)
                .HasMaxLength(50)
                .HasColumnName("name");
            entity.Property(e => e.OwnerId).HasColumnName("owner_id");

            entity.HasOne(d => d.Owner).WithMany(p => p.Groups)
                .HasForeignKey(d => d.OwnerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("groups_owner_id_fkey");
        });

        modelBuilder.Entity<GroupMember>(entity =>
        {
            entity.HasKey(e => new { e.GroupId, e.UserId }).HasName("group_members_pkey");

            entity.ToTable("group_members");

            entity.Property(e => e.GroupId).HasColumnName("group_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.JoinedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("joined_at");
            entity.Property(e => e.Role)
                .HasMaxLength(20)
                .HasDefaultValueSql("'Member'::character varying")
                .HasColumnName("role");

            entity.HasOne(d => d.Group).WithMany(p => p.GroupMembers)
                .HasForeignKey(d => d.GroupId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("group_members_group_id_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.GroupMembers)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("group_members_user_id_fkey");
        });

        modelBuilder.Entity<Invitation>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("invitations_pkey");

            entity.ToTable("invitations");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            entity.Property(e => e.GroupId).HasColumnName("group_id");
            entity.Property(e => e.ReceiverId).HasColumnName("receiver_id");
            entity.Property(e => e.SenderId).HasColumnName("sender_id");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValueSql("'Pending'::character varying")
                .HasColumnName("status");

            entity.HasOne(d => d.Group).WithMany(p => p.Invitations)
                .HasForeignKey(d => d.GroupId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("invitations_group_id_fkey");

            entity.HasOne(d => d.Receiver).WithMany(p => p.InvitationReceivers)
                .HasForeignKey(d => d.ReceiverId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("invitations_receiver_id_fkey");

            entity.HasOne(d => d.Sender).WithMany(p => p.InvitationSenders)
                .HasForeignKey(d => d.SenderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("invitations_sender_id_fkey");
        });

        modelBuilder.Entity<League>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("leagues_pkey");

            entity.ToTable("leagues");

            entity.HasIndex(e => e.ExternalId, "leagues_external_id_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Country)
                .HasMaxLength(100)
                .HasColumnName("country");
            entity.Property(e => e.ExternalId)
                .HasMaxLength(50)
                .HasColumnName("external_id");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
        });

        modelBuilder.Entity<Match>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("matches_pkey");

            entity.ToTable("matches");

            entity.HasIndex(e => e.ExternalId, "matches_external_id_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AwayScore).HasColumnName("away_score");
            entity.Property(e => e.AwayTeamId).HasColumnName("away_team_id");
            entity.Property(e => e.ExternalId)
                .HasMaxLength(50)
                .HasColumnName("external_id");
            entity.Property(e => e.HomeScore).HasColumnName("home_score");
            entity.Property(e => e.HomeTeamId).HasColumnName("home_team_id");
            entity.Property(e => e.KickoffAt).HasColumnName("kickoff_at");
            entity.Property(e => e.LeagueId).HasColumnName("league_id");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValueSql("'scheduled'::character varying")
                .HasColumnName("status");

            entity.HasOne(d => d.AwayTeam).WithMany(p => p.MatchAwayTeams)
                .HasForeignKey(d => d.AwayTeamId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("matches_away_team_id_fkey");

            entity.HasOne(d => d.HomeTeam).WithMany(p => p.MatchHomeTeams)
                .HasForeignKey(d => d.HomeTeamId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("matches_home_team_id_fkey");

            entity.HasOne(d => d.League).WithMany(p => p.Matches)
                .HasForeignKey(d => d.LeagueId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("matches_league_id_fkey");
        });

        modelBuilder.Entity<Prediction>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("predictions_pkey");

            entity.ToTable("predictions");

            entity.HasIndex(e => new { e.UserId, e.MatchId }, "predictions_user_id_match_id_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            entity.Property(e => e.MatchId).HasColumnName("match_id");
            entity.Property(e => e.PointsAwarded).HasColumnName("points_awarded");
            entity.Property(e => e.PredictedAwayScore).HasColumnName("predicted_away_score");
            entity.Property(e => e.PredictedHomeScore).HasColumnName("predicted_home_score");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Match).WithMany(p => p.Predictions)
                .HasForeignKey(d => d.MatchId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("predictions_match_id_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.Predictions)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("predictions_user_id_fkey");
        });

        modelBuilder.Entity<Team>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("teams_pkey");

            entity.ToTable("teams");

            entity.HasIndex(e => e.ExternalId, "teams_external_id_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ExternalId)
                .HasMaxLength(50)
                .HasColumnName("external_id");
            entity.Property(e => e.LeagueId).HasColumnName("league_id");
            entity.Property(e => e.LogoUrl)
                .HasMaxLength(255)
                .HasColumnName("logo_url");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.ShortName)
                .HasMaxLength(10)
                .HasColumnName("short_name");

            entity.HasOne(d => d.League).WithMany(p => p.Teams)
                .HasForeignKey(d => d.LeagueId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("teams_league_id_fkey");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("users_pkey");

            entity.ToTable("users");

            entity.HasIndex(e => e.Email, "users_email_key").IsUnique();

            entity.HasIndex(e => e.GoogleId, "users_google_id_key").IsUnique();

            entity.HasIndex(e => e.Username, "users_username_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("email");
            entity.Property(e => e.GoogleId)
                .HasMaxLength(255)
                .HasColumnName("google_id");
            entity.Property(e => e.PasswordHash)
                .HasMaxLength(255)
                .HasColumnName("password_hash");
            entity.Property(e => e.Username)
                .HasMaxLength(30)
                .HasColumnName("username");

            entity.HasMany(d => d.Leagues).WithMany(p => p.Users)
                .UsingEntity<Dictionary<string, object>>(
                    "UserLeague",
                    r => r.HasOne<League>().WithMany()
                        .HasForeignKey("LeagueId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("user_leagues_league_id_fkey"),
                    l => l.HasOne<User>().WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("user_leagues_user_id_fkey"),
                    j =>
                    {
                        j.HasKey("UserId", "LeagueId").HasName("user_leagues_pkey");
                        j.ToTable("user_leagues");
                        j.IndexerProperty<long>("UserId").HasColumnName("user_id");
                        j.IndexerProperty<int>("LeagueId").HasColumnName("league_id");
                    });
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
