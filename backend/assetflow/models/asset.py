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


class AssetFlowTransfer(models.Model):
    _name = 'assetflow.transfer'
    _description = 'AssetFlow Custodian Transfer Request'
    _order = 'id desc'

    asset_id = fields.Many2one('assetflow.asset', string='Asset', required=True, ondelete='cascade')
    current_owner = fields.Char(string='Current Custodian')
    requested_owner = fields.Char(string='Requested Custodian', required=True)
    state = fields.Selection([
        ('requested', 'Requested'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected')
    ], string='Status State', default='requested', required=True)
    request_date = fields.Date(string='Request Date', default=fields.Date.context_today)


class AssetFlowBooking(models.Model):
    _name = 'assetflow.booking'
    _description = 'AssetFlow Resource Booking'
    _order = 'booking_date desc, start_time asc'

    asset_id = fields.Many2one('assetflow.asset', string='Asset', required=True, ondelete='cascade')
    booking_date = fields.Date(string='Booking Date', required=True)
    start_time = fields.Float(string='Start Hour', required=True)
    end_time = fields.Float(string='End Hour', required=True)
    employee_name = fields.Char(string='Employee Name', required=True)
