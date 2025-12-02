from rest_framework import serializers
from .models import Medicine
from datetime import datetime

class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = ["id","name","category","quantity","min_stock","price","expiry_date",
                  "supplier","batch_no","prescription_required","created_at"]
        read_only_fields = ["id","created_at"]

    # accept dd-mm-yyyy or yyyy-mm-dd
    def validate_expiry_date(self, value):
        if isinstance(value, str):
            for fmt in ("%d-%m-%Y", "%Y-%m-%d"):
                try:
                    return datetime.strptime(value, fmt).date()
                except ValueError:
                    pass
            raise serializers.ValidationError("Invalid date format. Use dd-mm-yyyy.")
        return value

    # Outbound: camelCase for your frontend
    def to_representation(self, instance):
        d = super().to_representation(instance)
        d["minStock"] = d.pop("min_stock")
        d["expiryDate"] = instance.expiry_date.strftime("%d-%m-%Y")
        d["batchNo"] = d.pop("batch_no")
        d["prescriptionRequired"] = d.pop("prescription_required")
        return d

    # Inbound: camelCase → snake_case
    def to_internal_value(self, data):
        m = data.copy()
        if "minStock" in m:       m["min_stock"] = m.pop("minStock")
        if "batchNo" in m:        m["batch_no"] = m.pop("batchNo")
        if "expiryDate" in m:     m["expiry_date"] = m.pop("expiryDate")
        if "prescriptionRequired" in m:
            m["prescription_required"] = m.pop("prescriptionRequired")
        return super().to_internal_value(m)
