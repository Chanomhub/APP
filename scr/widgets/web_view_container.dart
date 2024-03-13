import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_cookie_manager/webview_cookie_manager.dart';

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: ThemeData(useMaterial3: true),
      home: WebViewApp(),
    );
  }
}

class WebViewApp extends StatefulWidget {
  const WebViewApp({super.key});

  @override
  State<WebViewApp> createState() => _WebViewAppState();
}

class _WebViewAppState extends State<WebViewApp> {
  late final WebViewController controller;
  int _selectedIndex = 0; // For tracking current page
  final cookieManager = WebviewCookieManager();

  Future<bool> areCookiesPresent() async {
    // Replace with names of actual cookies you want to check
    final cookies = await cookieManager.getCookies('https://chanomhub.xyz');
    return cookies.any((cookie) => cookie.name == 'hmwp_logged_in_login');
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
      switch (index) {
        case 0:
          controller.loadRequest(Uri.parse('https://chanomhub.xyz'));
          break;
        case 1:
          controller.loadRequest(Uri.parse('https://chanomhub.xyz/setting/')); // Example forum page
          break;
        case 2:
          controller.loadRequest(Uri.parse('https://chanomhub.xyz/forums')); // Example forum page
          break;
      // Add more cases for other pages
      }
    });
  }

  @override
  void initState() {
    super.initState();

    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..loadRequest(Uri.parse('https://chanomhub.xyz'));

    areCookiesPresent().then((hasCookies) {
      setState(() {}); // Force a rebuild after the cookie check
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: WebViewWidget(controller: controller),

        bottomNavigationBar: FutureBuilder(

          future: areCookiesPresent(),

          builder: (context, snapshot) {

            if (snapshot.hasData && snapshot.data!) { // Cookies are present

              return BottomNavigationBar(

                items: const <BottomNavigationBarItem>[
                  BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
                  BottomNavigationBarItem(icon: Icon(Icons.account_circle_outlined), label: 'Profile'),

                ],
                currentIndex: _selectedIndex,
                selectedItemColor: Colors.black,
                unselectedItemColor: Colors.black,
                onTap: _onItemTapped,
                type: BottomNavigationBarType.fixed,
              );
            } else { // Cookies are missing
              return BottomNavigationBar(
                items: const <BottomNavigationBarItem>[
                  BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
                  BottomNavigationBarItem(icon: Icon(Icons.account_circle_outlined), label: 'Profile'),
                  BottomNavigationBarItem(icon: Icon(Icons.forum), label: 'Forums'),
                ],
                currentIndex: _selectedIndex,
                selectedItemColor: Colors.black,
                unselectedItemColor: Colors.black,
                onTap: _onItemTapped,
                type: BottomNavigationBarType.fixed,
              );

            }

          },
        )
    );
  }

}