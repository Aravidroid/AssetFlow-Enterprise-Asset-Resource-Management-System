# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request
import datetime

class AssetFlowAPI(http.Controller):

    # Seed data generator helper with self-healing deduplication
    def _ensure_seed_assets(self, AssetModel):
        # Seed standard employees if the HR module is installed
        sarah = None
        aravind = None
        emma = None
        
        if 'hr.employee' in request.env:
            Employee = request.env['hr.employee'].sudo()
            sarah = Employee.search([('name', '=', 'Sarah Jenkins')], limit=1)
            if not sarah:
                sarah = Employee.create({'name': 'Sarah Jenkins'})
            
            aravind = Employee.search([('name', '=', 'Aravind')], limit=1)
            if not aravind:
                aravind = Employee.create({'name': 'Aravind'})
                
            emma = Employee.search([('name', '=', 'Emma Watson')], limit=1)
            if not emma:
                emma = Employee.create({'name': 'Emma Watson'})

        # Default seeds mapping to initial assets structure
        seeds = [
            {
                'name': 'MacBook Pro M3 Max',
                'serial_no': 'AF-0001',
                'cost': 3500.0,
                'purchase_date': '2024-05-10',
                'warranty_end_date': '2027-05-10',
                'condition_rating': 'good',
                'maintenance_count': 2,
                'state': 'allocated',
                'employee_id': sarah.id if sarah else False
            },
            {
                'name': 'Dell UltraSharp 32" 4K Monitor',
                'serial_no': 'AF-0002',
                'cost': 900.0,
                'purchase_date': '2023-01-15',
                'warranty_end_date': '2026-01-15',
                'condition_rating': 'excellent',
                'maintenance_count': 1,
                'state': 'available',
            },
            {
                'name': 'Tesla Model Y (Company Car)',
                'serial_no': 'AF-0003',
                'cost': 48000.0,
                'purchase_date': '2022-09-01',
                'warranty_end_date': '2027-09-01',
                'condition_rating': 'good',
                'maintenance_count': 5,
                'state': 'allocated',
                'employee_id': aravind.id if aravind else False
            },
            {
                'name': 'Cisco Router',
                'serial_no': 'AF-0004',
                'cost': 4505.0,
                'purchase_date': '2020-03-12',
                'warranty_end_date': '2025-03-12',
                'condition_rating': 'poor',
                'maintenance_count': 8,
                'state': 'available',
            },
            {
                'name': 'Ergonomic Office Chair (Steelcase)',
                'serial_no': 'AF-0005',
                'cost': 1200.0,
                'purchase_date': '2025-02-18',
                'warranty_end_date': '2035-02-18',
                'condition_rating': 'excellent',
                'maintenance_count': 0,
                'state': 'available',
            },
            {
                'name': 'iPad Pro 12.9 (Design Team)',
                'serial_no': 'AF-0006',
                'cost': 1400.0,
                'purchase_date': '2024-11-20',
                'warranty_end_date': '2026-11-20',
                'condition_rating': 'fair',
                'maintenance_count': 3,
                'state': 'maintenance',
            },
            {
                'name': 'Conference Room Projector (Epson)',
                'serial_no': 'AF-0007',
                'cost': 2200.0,
                'purchase_date': '2023-08-05',
                'warranty_end_date': '2025-08-05',
                'condition_rating': 'good',
                'maintenance_count': 4,
                'state': 'allocated',
                'employee_id': emma.id if emma else False
            }
        ]

        # 1. Clean up duplicate records in the database first
        all_records = AssetModel.search([])
        seen_serials = set()
        for r in all_records:
            if r.serial_no in seen_serials:
                r.unlink()
            else:
                seen_serials.add(r.serial_no)

        # 2. Check individual serial tags before creating to avoid seeding duplicates
        for s in seeds:
            existing = AssetModel.search([('serial_no', '=', s['serial_no'])], limit=1)
            if not existing:
                AssetModel.create(s)

    def _compute_asset_intelligence(self, asset):
        # 1. Age Calculation in Years
        current_date = datetime.date(2026, 7, 12)
        purchase_date = asset.purchase_date or current_date
        age_days = (current_date - purchase_date).days
        age_years = max(0.0, age_days / 365.25)
        age_penalty = round(age_years * 2, 1)

        # 2. Maintenance Penalty
        maint_penalty = asset.maintenance_count * 5

        # 3. Condition Penalty
        cond_penalty = 0
        cond = asset.condition_rating
        if cond == 'good': cond_penalty = 5
        elif cond == 'fair': cond_penalty = 10
        elif cond == 'poor': cond_penalty = 20
        elif cond == 'critical': cond_penalty = 30 # standard critical scale

        # 4. Warranty Penalty
        warranty_end = asset.warranty_end_date or current_date
        warranty_days_left = (warranty_end - current_date).days
        is_expired = warranty_days_left <= 0

        warranty_penalty = 0
        if is_expired:
            warranty_penalty = 10
        elif warranty_days_left <= 30:
            warranty_penalty = 5

        # 5. Clamped Health Score
        raw_health = 100 - age_penalty - maint_penalty - cond_penalty - warranty_penalty
        health_score = max(0, min(100, int(round(raw_health))))

        # Maintenance Priority
        maintenance_priority = "Low"
        health_status = "Healthy"
        health_color = "green"

        if health_score < 40:
            maintenance_priority = "Critical"
            health_status = "Critical"
            health_color = "red"
        elif health_score < 70:
            maintenance_priority = "High"
            health_status = "Critical"
            health_color = "red"
        elif health_score < 90:
            maintenance_priority = "Medium"
            health_status = "Warning"
            health_color = "yellow"

        # 6. Efficiency Calculation (Simulating historical allocated percentage)
        # Headless mock tracking allocates 80% to allocated, 15% to others
        efficiency = 0
        if asset.state == 'allocated':
            efficiency = 85
        elif asset.state == 'available':
            efficiency = 15
        
        efficiency_level = "Low"
        if efficiency >= 70:
            efficiency_level = "High"
        elif efficiency >= 30:
            efficiency_level = "Moderate"

        # 7. Recommendations
        recommendation = "Operating Normally"
        if health_score < 40:
            recommendation = "Replace Asset"
        elif cond == 'poor' or cond == 'critical':
            recommendation = "Repair Asset"
        elif efficiency < 30:
            recommendation = "Reallocate Asset"
        elif warranty_days_left <= 30:
            recommendation = "Renew Warranty"

        # 8. Idle and alerts criteria checks
        idle_days = 0
        is_idle = False
        if asset.state == 'available':
            idle_days = min(120, max(0, age_days - 30))
            if idle_days > 30:
                is_idle = True

        is_maintenance_overdue = age_days > 180 and asset.maintenance_count == 0

        # Construct historical events
        history = [
            { 'date': purchase_date.strftime('%Y-%m-%d'), 'type': 'Created', 'note': 'Asset registered in headless ERP.' }
        ]
        
        # Load associated bookings dynamically
        if 'assetflow.booking' in request.env:
            Bookings = request.env['assetflow.booking'].sudo().search([('asset_id', '=', asset.id)], order='booking_date asc')
            for b in Bookings:
                history.append({
                    'date': b.booking_date.strftime('%Y-%m-%d'),
                    'type': 'Booking',
                    'note': f"Booked by {b.employee_name} from {int(b.start_time):02d}:{int((b.start_time % 1) * 60):02d} to {int(b.end_time):02d}:{int((b.end_time % 1) * 60):02d}."
                })

        # Load associated transfers dynamically
        if 'assetflow.transfer' in request.env:
            Transfers = request.env['assetflow.transfer'].sudo().search([('asset_id', '=', asset.id)], order='request_date asc')
            for t in Transfers:
                state_lbl = "Approved" if t.state == 'approved' else ("Rejected" if t.state == 'rejected' else "Requested")
                history.append({
                    'date': t.request_date.strftime('%Y-%m-%d'),
                    'type': 'Transfer',
                    'note': f"Transfer from {t.current_owner or 'Unassigned'} to {t.requested_owner} ({state_lbl})."
                })

        if asset.state == 'allocated' and not any(h['type'] == 'Transfer' and 'Approved' in h['note'] for h in history):
            history.append({ 'date': '2026-06-01', 'type': 'Allocated', 'note': f"Assigned to {asset.employee_id.name or 'custodian'}." })
        elif asset.state == 'maintenance':
            history.append({ 'date': '2026-06-30', 'type': 'Maintenance', 'note': 'Service schedule active.' })

        return {
            'id': asset.serial_no,
            'odoo_db_id': asset.id,
            'name': asset.name,
            'category': asset.department_id.name or 'IT Hardware',
            'status': 'Allocated' if asset.state == 'allocated' else ('Under Maintenance' if asset.state == 'maintenance' else ('Disposed' if asset.state == 'retired' else 'Available')),
            'purchaseDate': purchase_date.strftime('%Y-%m-%d'),
            'warrantyYears': int(round(age_years + (warranty_days_left / 365.25))) if warranty_days_left > 0 else 2,
            'cost': asset.cost,
            'description': f"Serial: {asset.serial_no} managed in Odoo ERP.",
            'condition': cond.capitalize(),
            'maintenanceCount': asset.maintenance_count,
            'age': round(age_years, 2),
            'healthScore': health_score,
            'healthStatus': health_status,
            'healthColor': health_color,
            'maintenancePriority': maintenance_priority,
            'efficiency': efficiency,
            'efficiencyLevel': efficiency_level,
            'idleDays': idle_days,
            'isIdle': is_idle,
            'recommendation': recommendation,
            'warrantyDaysLeft': max(0, warranty_days_left),
            'isWarrantyExpired': is_expired,
            'warrantyStatusText': "Expired" if is_expired else f"{warranty_days_left} Days Left",
            'isMaintenanceOverdue': is_maintenance_overdue,
            'daysSinceLastMaintenance': 45, # mock
            'hasAlerts': health_score < 40 or efficiency < 30 or warranty_days_left <= 30 or is_maintenance_overdue or is_idle,
            'history': history,
            'currentUser': asset.employee_id.name if asset.employee_id else None,
            'healthBreakdown': {
                'base': 100,
                'age': round(age_years, 2),
                'agePenalty': age_penalty,
                'maintenanceCount': asset.maintenance_count,
                'maintenancePenalty': maint_penalty,
                'condition': cond.capitalize(),
                'conditionPenalty': cond_penalty,
                'warrantyDaysLeft': max(0, warranty_days_left),
                'warrantyPenalty': warranty_penalty,
                'rawScore': raw_health
            }
        }

    # API Endpoints
    @http.route('/api/assetflow/assets', type='json', auth='none', methods=['POST'])
    def get_assets(self):
        Asset = request.env['assetflow.asset'].sudo()
        self._ensure_seed_assets(Asset)
        records = Asset.search([])
        return [self._compute_asset_intelligence(r) for r in records]

    @http.route('/api/assetflow/dashboard_summary', type='json', auth='none', methods=['POST'])
    def get_dashboard_summary(self):
        Asset = request.env['assetflow.asset'].sudo()
        self._ensure_seed_assets(Asset)
        records = Asset.search([])
        assets = [self._compute_asset_intelligence(r) for r in records]

        total = len(assets)
        available = len([a for a in assets if a['status'] == 'Available'])
        allocated = len([a for a in assets if a['status'] == 'Allocated'])
        maint = len([a for a in assets if a['status'] == 'Under Maintenance'])
        critical = len([a for a in assets if a['healthScore'] < 40])
        idle = len([a for a in assets if a['isIdle']])
        warranty = len([a for a in assets if a['warrantyDaysLeft'] <= 30])
        maint_overdue = len([a for a in assets if a['isMaintenanceOverdue']])

        avg_health = round(sum(a['healthScore'] for a in assets) / total) if total > 0 else 100
        avg_eff = round(sum(a['efficiency'] for a in assets) / total) if total > 0 else 0

        # Risk Score
        risk_num = (critical * 5) + (idle * 2) + (warranty * 2) + (maint_overdue * 3)
        risk_score = round(risk_num / total, 1) if total > 0 else 0.0

        # Executive Decision Center: Calculate Expected Savings and Actionable Priorities
        decisions = []
        for a in assets:
            if a['status'] == 'Disposed':
                continue
            
            if a['healthScore'] < 40:
                savings_usd = a['cost'] * 0.40
                decisions.append({
                    'id': a['id'],
                    'type': 'replace',
                    'text': f"Replace {a['name']} ({a['id']})",
                    'savings': savings_usd
                })
            elif a['isIdle']:
                savings_usd = a['cost'] * 0.25
                decisions.append({
                    'id': a['id'],
                    'type': 'reallocate',
                    'text': f"Reallocate Idle {a['name']} ({a['id']})",
                    'savings': savings_usd
                })
            elif a['warrantyDaysLeft'] <= 30:
                savings_usd = a['cost'] * 0.10
                decisions.append({
                    'id': a['id'],
                    'type': 'warranty',
                    'text': f"Renew Warranty {a['name']} ({a['id']})",
                    'savings': savings_usd
                })

        # Sort by savings descending and pick top 3
        decisions.sort(key=lambda x: x['savings'], reverse=True)
        top_decisions = decisions[:3]
        total_savings_usd = sum(d['savings'] for d in top_decisions)
        total_savings_inr_lakhs = (total_savings_usd * 85) / 100000

        return {
            'total_assets': total,
            'available': available,
            'allocated': allocated,
            'under_maintenance': maint,
            'critical_issues': critical,
            'idle_count': idle,
            'warranty_expiring': warranty,
            'health_score': avg_health,
            'average_efficiency': avg_eff,
            'risk_score': risk_score,
            'expected_savings_lakhs': round(total_savings_inr_lakhs, 2),
            'priorities': top_decisions
        }

    @http.route('/api/assetflow/run_audit', type='json', auth='none', methods=['POST'])
    def run_audit(self):
        Asset = request.env['assetflow.asset'].sudo()
        self._ensure_seed_assets(Asset)
        records = Asset.search([])
        assets = [self._compute_asset_intelligence(r) for r in records]
        
        total = len(assets)
        critical = len([a for a in assets if a['healthScore'] < 40])
        idle = len([a for a in assets if a['isIdle']])
        maint_overdue = len([a for a in assets if a['isMaintenanceOverdue']])
        warranty_expired = len([a for a in assets if a['isWarrantyExpired'] or a['warrantyDaysLeft'] <= 30])
        
        failed = len([a for a in assets if a['healthScore'] < 40 or a['isMaintenanceOverdue']])
        compliance_rate = round(((total - failed) / total) * 100) if total > 0 else 100
        
        return {
            'scannedCount': total,
            'complianceRate': compliance_rate,
            'criticalAnomalies': critical,
            'overdueMaint': maint_overdue,
            'idleDevices': idle,
            'warrantyIssues': warranty_expired
        }

    @http.route('/api/assetflow/allocate', type='json', auth='none', methods=['POST'])
    def allocate_asset(self, id, user):
        Asset = request.env['assetflow.asset'].sudo()
        record = Asset.search([('serial_no', '=', id)], limit=1)
        if record:
            emp_id = False
            if 'hr.employee' in request.env:
                Employee = request.env['hr.employee'].sudo()
                emp = Employee.search([('name', '=', user)], limit=1)
                if not emp and user:
                    emp = Employee.create({'name': user})
                emp_id = emp.id if emp else False
            record.write({
                'state': 'allocated',
                'employee_id': emp_id
            })
            return self._compute_asset_intelligence(record)
        return {'error': 'Asset not found'}

    @http.route('/api/assetflow/return', type='json', auth='none', methods=['POST'])
    def return_asset(self, id):
        Asset = request.env['assetflow.asset'].sudo()
        record = Asset.search([('serial_no', '=', id)], limit=1)
        if record:
            record.write({
                'state': 'available',
                'employee_id': False
            })
            return self._compute_asset_intelligence(record)
        return {'error': 'Asset not found'}

    @http.route('/api/assetflow/log_maintenance', type='json', auth='none', methods=['POST'])
    def log_maintenance(self, id, note):
        Asset = request.env['assetflow.asset'].sudo()
        record = Asset.search([('serial_no', '=', id)], limit=1)
        if record:
            record.write({
                'state': 'maintenance',
                'maintenance_count': record.maintenance_count + 1
            })
            return self._compute_asset_intelligence(record)
        return {'error': 'Asset not found'}

    @http.route('/api/assetflow/complete_maintenance', type='json', auth='none', methods=['POST'])
    def complete_maintenance(self, id, target_status="available"):
        Asset = request.env['assetflow.asset'].sudo()
        record = Asset.search([('serial_no', '=', id)], limit=1)
        if record:
            record.write({
                'state': 'available' if target_status == 'Available' else 'available',
            })
            return self._compute_asset_intelligence(record)
        return {'error': 'Asset not found'}

    @http.route('/api/assetflow/add_asset', type='json', auth='none', methods=['POST'])
    def add_asset(self, asset_data):
        Asset = request.env['assetflow.asset'].sudo()
        
        # Gen tag serial
        records = Asset.search([])
        numeric_tags = []
        for r in records:
            parts = r.serial_no.split("-")
            if len(parts) == 2:
                try:
                    numeric_tags.append(int(parts[1]))
                except:
                    pass
        max_num = max(numeric_tags) if numeric_tags else 0
        next_id = f"AF-{str(max_num + 1).zfill(4)}"

        new_record = Asset.create({
            'name': asset_data.get('name', 'Unnamed Asset'),
            'serial_no': next_id,
            'cost': float(asset_data.get('cost', 0.0) or 0.0),
            'purchase_date': asset_data.get('purchaseDate', '2026-07-12'),
            'warranty_end_date': '2029-07-12', # standard 3 yr end date
            'condition_rating': asset_data.get('condition', 'excellent').lower(),
            'state': 'available'
        })
        return self._compute_asset_intelligence(new_record)

    @http.route('/api/assetflow/update_asset', type='json', auth='none', methods=['POST'])
    def update_asset(self, id, asset_data):
        Asset = request.env['assetflow.asset'].sudo()
        record = Asset.search([('serial_no', '=', id)], limit=1)
        if record:
            record.write({
                'name': asset_data.get('name'),
                'cost': float(asset_data.get('cost', 0.0) or 0.0),
                'condition_rating': asset_data.get('condition', 'good').lower()
            })
            return self._compute_asset_intelligence(record)
        return {'error': 'Asset not found'}

    @http.route('/api/assetflow/transfer', type='json', auth='none', methods=['POST'])
    def transfer_asset(self, id, target_user):
        Asset = request.env['assetflow.asset'].sudo()
        record = Asset.search([('serial_no', '=', id)], limit=1)
        if record:
            emp_id = False
            if 'hr.employee' in request.env:
                Employee = request.env['hr.employee'].sudo()
                emp = Employee.search([('name', '=', target_user)], limit=1)
                if not emp and target_user:
                    emp = Employee.create({'name': target_user})
                emp_id = emp.id if emp else False
            record.write({
                'state': 'allocated',
                'employee_id': emp_id
            })
            return self._compute_asset_intelligence(record)
        return {'error': 'Asset not found'}

    @http.route('/api/assetflow/dispose', type='json', auth='none', methods=['POST'])
    def dispose_asset(self, id):
        Asset = request.env['assetflow.asset'].sudo()
        record = Asset.search([('serial_no', '=', id)], limit=1)
        if record:
            record.write({
                'state': 'retired',
                'employee_id': False
            })
            return self._compute_asset_intelligence(record)
        return {'error': 'Asset not found'}

    @http.route('/api/assetflow/get_transfers', type='json', auth='none', methods=['POST'])
    def get_transfers(self):
        Transfer = request.env['assetflow.transfer'].sudo()
        records = Transfer.search([])
        res = []
        for r in records:
            res.append({
                'id': r.id,
                'assetId': r.asset_id.serial_no,
                'assetName': r.asset_id.name,
                'currentOwner': r.current_owner,
                'requestedOwner': r.requested_owner,
                'state': r.state,
                'requestDate': r.request_date.strftime('%Y-%m-%d')
            })
        return res

    @http.route('/api/assetflow/create_transfer', type='json', auth='none', methods=['POST'])
    def create_transfer(self, asset_id, requested_owner):
        Asset = request.env['assetflow.asset'].sudo()
        Transfer = request.env['assetflow.transfer'].sudo()
        
        asset_record = Asset.search([('serial_no', '=', asset_id)], limit=1)
        if not asset_record:
            return {'error': 'Asset not found'}
            
        current_owner = asset_record.employee_id.name if asset_record.employee_id else 'Unassigned'
        
        t_req = Transfer.create({
            'asset_id': asset_record.id,
            'current_owner': current_owner,
            'requested_owner': requested_owner,
            'state': 'requested'
        })
        
        return {
            'id': t_req.id,
            'assetId': asset_record.serial_no,
            'assetName': asset_record.name,
            'currentOwner': current_owner,
            'requestedOwner': requested_owner,
            'state': 'requested',
            'requestDate': t_req.request_date.strftime('%Y-%m-%d')
        }

    @http.route('/api/assetflow/approve_transfer', type='json', auth='none', methods=['POST'])
    def approve_transfer(self, transfer_id):
        Transfer = request.env['assetflow.transfer'].sudo()
        t_req = Transfer.browse(transfer_id)
        if not t_req.exists():
            return {'error': 'Transfer Request not found'}
            
        t_req.write({'state': 'approved'})
        
        asset_record = t_req.asset_id
        emp_id = False
        if 'hr.employee' in request.env and t_req.requested_owner:
            Employee = request.env['hr.employee'].sudo()
            emp = Employee.search([('name', '=', t_req.requested_owner)], limit=1)
            if not emp:
                emp = Employee.create({'name': t_req.requested_owner})
            emp_id = emp.id
            
        asset_record.write({
            'state': 'allocated',
            'employee_id': emp_id
        })
        return {'success': True}

    @http.route('/api/assetflow/reject_transfer', type='json', auth='none', methods=['POST'])
    def reject_transfer(self, transfer_id):
        Transfer = request.env['assetflow.transfer'].sudo()
        t_req = Transfer.browse(transfer_id)
        if not t_req.exists():
            return {'error': 'Transfer Request not found'}
            
        t_req.write({'state': 'rejected'})
        return {'success': True}

    @http.route('/api/assetflow/get_bookings', type='json', auth='none', methods=['POST'])
    def get_bookings(self):
        Booking = request.env['assetflow.booking'].sudo()
        records = Booking.search([])
        res = []
        for r in records:
            res.append({
                'id': r.id,
                'assetId': r.asset_id.serial_no,
                'assetName': r.asset_id.name,
                'bookingDate': r.booking_date.strftime('%Y-%m-%d'),
                'startTime': r.start_time,
                'endTime': r.end_time,
                'employeeName': r.employee_name
            })
        return res

    @http.route('/api/assetflow/create_booking', type='json', auth='none', methods=['POST'])
    def create_booking(self, asset_id, booking_date, start_time, end_time, employee_name):
        Asset = request.env['assetflow.asset'].sudo()
        Booking = request.env['assetflow.booking'].sudo()
        
        asset_record = Asset.search([('serial_no', '=', asset_id)], limit=1)
        if not asset_record:
            return {'error': 'Asset not found'}
            
        conflict = Booking.search([
            ('asset_id', '=', asset_record.id),
            ('booking_date', '=', booking_date),
            ('start_time', '<', float(end_time)),
            ('end_time', '>', float(start_time))
        ], limit=1)
        
        if conflict:
            return {
                'error': 'Conflict',
                'message': f"Resource is already booked on this date from {int(conflict.start_time):02d}:{int((conflict.start_time % 1) * 60):02d} to {int(conflict.end_time):02d}:{int((conflict.end_time % 1) * 60):02d}."
            }
            
        new_b = Booking.create({
            'asset_id': asset_record.id,
            'booking_date': booking_date,
            'start_time': float(start_time),
            'end_time': float(end_time),
            'employee_name': employee_name
        })
        
        return {
            'id': new_b.id,
            'assetId': asset_record.serial_no,
            'assetName': asset_record.name,
            'bookingDate': new_b.booking_date.strftime('%Y-%m-%d'),
            'startTime': new_b.start_time,
            'endTime': new_b.end_time,
            'employeeName': new_b.employee_name
        }
