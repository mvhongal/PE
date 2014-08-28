package com.netiq.cg.policyeditor.servlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * This Servlet forwards requests different hosts.
 * @author Tamal Kanti Nath
 */
@WebServlet("/ProxyServlet")
public class ProxyServlet extends HttpServlet {

    private static final long serialVersionUID = 2866800429162545126L;

    @Override
    public void doGet(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        //TODO: forward the request
        System.out.println(req.getParameterMap());
    }

    @Override
    public void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        //TODO: forward the request
        System.out.println(req.getParameterMap());
    }

}
