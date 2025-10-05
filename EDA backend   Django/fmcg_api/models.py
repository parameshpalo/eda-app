from django.db import models

class FMCGData(models.Model):
    class Meta:
        db_table = "fmcg_data"

    # Identifiers
    id = models.AutoField(primary_key=True)
    br_cat_id = models.CharField(max_length=255, null=True, blank=True)

    # Dimensions
    market = models.CharField(max_length=255, null=True, blank=True)
    channel = models.CharField(max_length=255, null=True, blank=True)
    region = models.CharField(max_length=255, null=True, blank=True)
    category = models.CharField(max_length=255, null=True, blank=True)
    sub_category = models.CharField(max_length=255, null=True, blank=True)
    brand = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    variant = models.CharField(max_length=255, null=True, blank=True)
    pack_type = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    ppg = models.CharField(max_length=255, null=True, blank=True)
    pack_size = models.CharField(max_length=255, null=True, blank=True)

    # Time
    year = models.IntegerField(null=True, db_index=True)
    month = models.IntegerField(null=True, db_index=True)
    week = models.IntegerField(null=True, blank=True)
    date = models.DateField(null=True, db_index=True)

    # Metrics
    sales_value = models.FloatField(default=0.0)
    volume = models.FloatField(default=0.0)
    volume_units = models.FloatField(null=True, blank=True)

    # Derived / experimental metrics
    d1 = models.FloatField(null=True, blank=True)
    d2 = models.FloatField(null=True, blank=True)
    d3 = models.FloatField(null=True, blank=True)
    d4 = models.FloatField(null=True, blank=True)
    d5 = models.FloatField(null=True, blank=True)
    d6 = models.FloatField(null=True, blank=True)

    av1 = models.FloatField(null=True, blank=True)
    av2 = models.FloatField(null=True, blank=True)
    av3 = models.FloatField(null=True, blank=True)
    av4 = models.FloatField(null=True, blank=True)
    av5 = models.FloatField(null=True, blank=True)
    av6 = models.FloatField(null=True, blank=True)

    ev1 = models.FloatField(null=True, blank=True)
    ev2 = models.FloatField(null=True, blank=True)
    ev3 = models.FloatField(null=True, blank=True)
    ev4 = models.FloatField(null=True, blank=True)
    ev5 = models.FloatField(null=True, blank=True)
    ev6 = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"<FMCGData id={self.id} brand={self.brand} year={self.year} month={self.month} sales={self.sales_value}>"
