# -*- coding: utf-8 -*-
from odoo import models, fields, api

class AssetFlowAsset(models.Model):
    _name = 'assetflow.asset'
    _description = 'AssetFlow Corporate Asset'

    name = fields.Char(string='Asset Name', required=True)
    serial_no = fields.Char(string='Serial Number', required=True)
    cost = fields.Float(string='Cost (USD)', default=0.0)
    purchase_date = fields.Date(string='Purchase Date')
    warranty_end_date = fields.Date(string='Warranty End Date')
    
    condition_rating = fields.Selection([
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('poor', 'Poor'),
        ('critical', 'Critical')
    ], string='Condition Rating', default='excellent')
    
    maintenance_count = fields.Integer(string='Maintenance Count', default=0)
    
    state = fields.Selection([
        ('available', 'Available'),
        ('allocated', 'Allocated'),
        ('maintenance', 'Under Maintenance'),
        ('retired', 'Retired')
    ], string='Status State', default='available')

    # ERP Native Integrations
    employee_id = fields.Many2one('hr.employee', string='Custodian Employee')
    department_id = fields.Many2one('hr.department', string='Allocated Department')
