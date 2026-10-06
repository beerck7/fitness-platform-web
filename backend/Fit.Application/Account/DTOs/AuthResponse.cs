using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fit.Application.Account.DTOs
{
    public class AuthResponse(string accessToken, string refreshToken, string userName)
    {
        public string AccessToken { get; set; } = accessToken;
        public string RefreshToken { get; set; } = refreshToken;
        public string UserName { get; set; } = userName;

    }
}

