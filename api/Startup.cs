using System;
using System.Text;

using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;

using Mindmap.Models;
using Mindmap.Helpers;
using Mindmap.Services;
using Mindmap.Util;


namespace Mindmap
{
    public class Startup
    {
        public Startup(IConfiguration configuration, IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddJsonFile($"volume/secrets.json", optional: true)
                .AddEnvironmentVariables();

            Configuration = builder.Build();
        }

        public IConfiguration Configuration { get; }
        readonly string MyAllowSpecificOrigins = "";
        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_2);

            // inject variable to application layer from appsettings.json
            AppSettings appSettings = new AppSettings();
            Configuration.GetSection("Config").Bind(appSettings);

            // setup CROS if config file includ CROS section
            IConfigurationSection CROSSection = Configuration.GetSection("CROS");
            string crossOrigin = Configuration.GetSection("CROS").GetValue<string>("Origin");
            if (crossOrigin != null)
            {
                services.AddCors(options =>
                {
                    options.AddPolicy(MyAllowSpecificOrigins,
                    builder =>
                    {
                        builder.WithOrigins(crossOrigin).AllowAnyHeader().AllowAnyMethod().SetPreflightMaxAge(TimeSpan.FromSeconds(600)); ;
                    });
                });
            }

            services.Configure<AppSettings>(Configuration.GetSection("Config"));

            // setup db context
            services.AddDbContext<MindmapContext>(options => options.UseNpgsql(appSettings.Secrets.DBConnectionString));
            services.AddDbContext<MindmapContextForView>(options => options.UseNpgsql(appSettings.Secrets.DBConnectionString));

            // add JWT secret to application layer 
            var encodedJwtSecret = Encoding.ASCII.GetBytes(appSettings.Secrets.JwtKey);
            services.AddAuthentication(x =>
            {
                x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(x =>
            {
                x.RequireHttpsMetadata = false;
                x.SaveToken = true;
                x.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(encodedJwtSecret),
                    ValidateIssuer = false,
                    ValidateAudience = false
                };
                x.Events = new JwtBearerEvents()
                {
                    OnChallenge = context =>
                    {
                        context.HandleResponse();
                        context.Response.StatusCode = 403;
                        context.Response.ContentType = "application/json";
                        byte[] bytes = Encoding.UTF8.GetBytes(Newtonsoft.Json.JsonConvert.SerializeObject(new
                        {
                            status = JSONResponseStatus.FAILED,
                            data = new
                            {
                                message = "此頁面需要登入"
                            }
                        }));
                        return context.Response.Body.WriteAsync(bytes, 0, bytes.Length);
                    },
                    OnAuthenticationFailed = context =>
                    {
                        context.Response.StatusCode = 401;
                        context.Response.ContentType = "application/json";
                        byte[] bytes = Encoding.UTF8.GetBytes(Newtonsoft.Json.JsonConvert.SerializeObject(new
                        {
                            status = JSONResponseStatus.FAILED,
                            data = new
                            {
                                message = "憑證失效"
                            }
                        }));
                        return context.Response.Body.WriteAsync(bytes, 0, bytes.Length);
                    }
                };
            });

            // add middleware UserService for auth
            services.AddScoped<UserService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            Newtonsoft.Json.JsonConvert.SerializeObject(env);
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }
            app.UseCors(MyAllowSpecificOrigins);
            app.UseHttpsRedirection();
            app.UseAuthentication();
            app.UseMiddleware(typeof(ErrorHandlingMiddleware));
            app.UseMvc();

        }
    }
}
