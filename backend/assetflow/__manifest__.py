# -*- coding: utf-8 -*-
{
    'name': 'AssetFlow Headless Backend',
    'version': '1.0',
    'summary': 'Headless ERP Asset & Resource Management Database and REST API for AssetFlow frontend.',
    'sequence': 1,
    'description': """
AssetFlow Custom Odoo Module
====================================
Designed for headless Odoo integration. Actively handles database schemas, relations, and computations
without rendering any XML views.
    """,
    'category': 'Operations',
    'author': 'AssetFlow Team',
    'website': 'https://github.com/Aravidroid/AssetFlow-Enterprise-Asset-Resource-Management-System',
    'depends': [
        'base',
        'hr',
    ],
    'data': [
        'security/ir.model.access.csv',
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
    'license': 'LGPL-3',
}
