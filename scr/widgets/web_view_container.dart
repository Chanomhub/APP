import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_cookie_manager/webview_cookie_manager.dart';
import 'NavigationItem.dart';

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
  bool isLoggedIn = false;

  Future<bool> areCookiesPresent() async {
    // Replace with names of actual cookies you want to check
    final cookies = await cookieManager.getCookies('https://chanomhub.xyz');
    return cookies.any((cookie) => cookie.name == 'hmwp_logged_in_login');
  }

  // Define your navigation items
  List<NavigationItem> navigationItems = [
    NavigationItem(icon: Icons.home, label: 'Home', url: 'https://chanomhub.xyz'),
    NavigationItem(icon: Icons.account_circle_outlined, label: 'Profile', url: 'https://chanomhub.xyz/setting/', requiresLogin: true),
    NavigationItem(icon: Icons.forum, label: 'Forums', url: 'https://chanomhub.xyz/forum', requiresLogin: true),
    NavigationItem(icon: Icons.login, label: 'Login', url: 'https://chanomhub.xyz/newlogin')
  ];

  @override
  void initState() {
    super.initState();
    // ... (Your existing code)

    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..addJavaScriptChannel( // Add JavaScript Channel
        'Flutter',
        onMessageReceived: (message) {
          if (message.message == 'loginSuccess') {
            setState(() {
              isLoggedIn = true;
            });
          } else if (message.message == 'logoutSuccess') {
            setState(() {
              isLoggedIn = false;
            });
          } else if (message.message.startsWith('navigation:')) {
            _updateSelectedNavigation(message.message.substring(11));
          }
        },
      )
      ..loadRequest(Uri.parse(navigationItems.isNotEmpty ? navigationItems[0].url : 'https://chanomhub.xyz'));
  }

  void _updateSelectedNavigation(String url) {
    setState(() {
      _selectedIndex = navigationItems.indexWhere((item) => item.url == url);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: WebViewWidget(controller: controller),
      bottomNavigationBar: BottomNavigationBar(
        items: navigationItems.where((item) => !item.requiresLogin || isLoggedIn).map((item) =>
            BottomNavigationBarItem(
              icon: Icon(item.icon),
              label: item.label,
            )
        ).toList(),
        currentIndex: _selectedIndex,
        selectedItemColor: Colors.amber[800],
        onTap: (index) {
          if (navigationItems[index].requiresLogin && !isLoggedIn) {
            // Redirect to login page here
          } else {
            controller.loadRequest(Uri.parse(navigationItems[index].url));
          }
        },
      ),
    );
  }
}
