using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace url_shorten_service.Migrations
{
    /// <inheritdoc />
    public partial class AddUrlStatsFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Alias",
                table: "Url");

            migrationBuilder.AddColumn<int>(
                name: "ClickCount",
                table: "Url",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpiryDate",
                table: "Url",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastAccessed",
                table: "Url",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ClickCount",
                table: "Url");

            migrationBuilder.DropColumn(
                name: "ExpiryDate",
                table: "Url");

            migrationBuilder.DropColumn(
                name: "LastAccessed",
                table: "Url");

            migrationBuilder.AddColumn<string>(
                name: "Alias",
                table: "Url",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
