package com.netiq.cg.policyeditor.servlet;

import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.Proxy;
import java.net.ProxySelector;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.Enumeration;
import java.util.List;
import java.util.Scanner;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * This Servlet forwards requests different hosts.
 * 
 * @author Tamal Kanti Nath
 */
@WebServlet("/ProxyServlet")
public class ProxyServlet extends HttpServlet {

    private static final long serialVersionUID = 2866800429162545126L;

    static {
        HttpsURLConnection.setDefaultHostnameVerifier(new HostnameVerifier() {
            @Override
            public boolean verify(String hostname, SSLSession sslSession) {
                return true;
            }
        });
        TrustManager trustManager = new X509TrustManager() {
            @Override
            public X509Certificate[] getAcceptedIssuers() {
                return null;
            }

            @Override
            public void checkClientTrusted(X509Certificate[] chain,
                    String authType) throws CertificateException {
                return;
            }

            @Override
            public void checkServerTrusted(X509Certificate[] chain,
                    String authType) throws CertificateException {
                return;
            }
        };
        TrustManager[] trustManagers = new TrustManager[] { trustManager };
        try {
            SSLContext sc = SSLContext.getInstance("TLS");
            sc.init(null, trustManagers, new SecureRandom());
            HttpsURLConnection
                    .setDefaultSSLSocketFactory(sc.getSocketFactory());
        } catch (KeyManagementException e) {
            e.printStackTrace();
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void doGet(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        service(req, res);
    }

    @Override
    public void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        service(req, res);
    }

    @Override
    public void service(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        try {
            String url = URLDecoder.decode(req.getParameter("url"), "UTF-8");
            String method = req.getMethod();
            if (!("POST".equals(method) || "PUT".equals(method))) {
                url += "?" + getParameters(req);
            }
            HttpURLConnection conn = getProxyConnection(url);
            // conn.setConnectTimeout(60000);
            // conn.setReadTimeout(60000);
            addHeaders(conn, req);
            if ("POST".equals(method) || "PUT".equals(method)) {
                conn.setDoOutput(true);
                PrintWriter out = new PrintWriter(conn.getOutputStream());
                out.print(getParameters(req));
                out.flush();
            }
            prepareResponse(conn, res);
        } catch (IOException e) {
            res.sendError(500, e.getMessage());
        }
    }

    private static void prepareResponse(HttpURLConnection conn,
            HttpServletResponse res) throws IOException {
        for (int i = 1; conn.getHeaderFieldKey(i) != null; i++) {
            String key = conn.getHeaderFieldKey(i);
            String value = conn.getHeaderField(i);
            res.addHeader(key, value);
        }
        int status = conn.getResponseCode();
        if (status >= 200 && status <= 299) {
            res.setStatus(status);
            res.getOutputStream().print(toString(conn.getInputStream()));
        } else {
            res.sendError(status, conn.getResponseMessage());
        }
    }

    private static void addHeaders(URLConnection conn, HttpServletRequest req) {
        Enumeration<String> headers = req.getHeaderNames();
        while (headers.hasMoreElements()) {
            String name = headers.nextElement();
            String value = req.getHeader(name);
            conn.addRequestProperty(name, value);
        }
    }

    private static HttpURLConnection getProxyConnection(String url)
            throws MalformedURLException, IOException {
        System.setProperty("java.net.useSystemProxies", "true");
        List<Proxy> list;
        try {
            list = ProxySelector.getDefault().select(new URI(url));
        } catch (URISyntaxException e) {
            throw new MalformedURLException(e.getMessage());
        }
        URLConnection conn = null;
        for (Proxy proxy : list) {
            try {
                conn = new URL(url).openConnection(proxy);
                break;
            } catch (IllegalArgumentException e) {
                e.printStackTrace();
            }
        }
        if (conn == null) {
            conn = new URL(url).openConnection();
        }
        return (HttpURLConnection) conn;
    }

    private static String getParameters(HttpServletRequest req)
            throws UnsupportedEncodingException {
        Enumeration<String> parameters = req.getParameterNames();
        StringBuilder sb = new StringBuilder();
        while (parameters.hasMoreElements()) {
            String mame = parameters.nextElement();
            if (!"url".equals(mame)) {
                String value = req.getParameter(mame);
                sb.append("&").append(mame).append("=").append(value);
            }
        }
        if (sb.length() == 0) {
            return "";
        }
        return URLEncoder.encode(sb.substring(1), "UTF-8");
    }

    private static String toString(InputStream inputStream) {
        try (Scanner scanner = new Scanner(inputStream)) {
            return scanner.useDelimiter("\\A").next();
        }
    }
}
