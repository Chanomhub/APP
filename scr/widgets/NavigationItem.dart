import 'package:flutter/material.dart';


class NavigationItem {

  IconData icon;
  String label;
  String url;
  bool requiresLogin;

  NavigationItem(
      {required this.icon,
        required this.label,
        required this.url,
        this.requiresLogin = false});
}