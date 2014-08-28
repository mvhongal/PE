package com.netiq.cg.policyeditor.filter;
/*
 * Copyright 2014 NetIQ.
 *
 * Licensed under the NetIQ License (the "License"); you may not use this file
 * except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.netiq.com/company/legal
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * This filter will redirect to login page.
 *
 * @author Tamal Kanti Nath
 */
@WebFilter({"*.html", "*/"})
public class AuthenticationFilter implements Filter {

    private static final String LOGIN = "/login.html";

    @Override
    public void init(FilterConfig config) throws ServletException {
        // Empty
    }

    @Override
    public void destroy() {
        // Empty
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
            FilterChain chain) throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        if (LOGIN.equals(req.getRequestURI())) {
            chain.doFilter(req, response);
            return;
        }
        if (req.getSession().getAttribute("SAML_TOKEN") == null) {
            HttpServletResponse res = (HttpServletResponse) response;
            res.sendRedirect(LOGIN);
            return;
        }
        chain.doFilter(req, response);
    }

}
