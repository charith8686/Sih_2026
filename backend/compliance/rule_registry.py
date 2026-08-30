from typing import Dict, Any, List

PROTOTYPE_RULESET_VERSION = "PCR-2011-Amendment-2021-Prototype-v1.0"

RULES_REGISTRY: Dict[str, Dict[str, Any]] = {
    "LM-01": {
        "rule_id": "LM-01",
        "rule_name": "Manufacturer / Packer Name & Address",
        "description": "Name and complete physical address of the manufacturer or packer including street, city, state, and valid 6-digit postal PIN code.",
        "statutory_source": "Legal Metrology (Packaged Commodities) Rules 2011, Rule 6(1)(a)",
        "version": PROTOTYPE_RULESET_VERSION,
        "effective_from": "2011-04-01",
        "effective_until": None,
        "default_severity": "High",
        "applicable_modes": ["physical_package", "ecommerce_listing"]
    },
    "LM-02": {
        "rule_id": "LM-02",
        "rule_name": "Common / Generic Name of Commodity",
        "description": "The common or generic name of the commodity contained in the package to prevent misleading trade descriptions.",
        "statutory_source": "Legal Metrology (Packaged Commodities) Rules 2011, Rule 6(1)(b)",
        "version": PROTOTYPE_RULESET_VERSION,
        "effective_from": "2011-04-01",
        "effective_until": None,
        "default_severity": "High",
        "applicable_modes": ["physical_package", "ecommerce_listing"]
    },
    "LM-03": {
        "rule_id": "LM-03",
        "rule_name": "Net Quantity",
        "description": "Net quantity of the commodity in standard metric units (g, kg, ml, l, or count) without non-standard symbols like 'gms' or 'kgs'.",
        "statutory_source": "Legal Metrology (Packaged Commodities) Rules 2011, Rule 6(1)(c) & Rule 11",
        "version": PROTOTYPE_RULESET_VERSION,
        "effective_from": "2011-04-01",
        "effective_until": None,
        "default_severity": "Critical",
        "applicable_modes": ["physical_package", "ecommerce_listing"]
    },
    "LM-04": {
        "rule_id": "LM-04",
        "rule_name": "Month & Year of Manufacture / Packing / Import",
        "description": "Month and Year in which the commodity is manufactured, packed, or imported (e.g. MM/YYYY or Month YYYY).",
        "statutory_source": "Legal Metrology (Packaged Commodities) Rules 2011, Rule 6(1)(d)",
        "version": PROTOTYPE_RULESET_VERSION,
        "effective_from": "2011-04-01",
        "effective_until": None,
        "default_severity": "High",
        "applicable_modes": ["physical_package", "ecommerce_listing"]
    },
    "LM-05": {
        "rule_id": "LM-05",
        "rule_name": "Expiry / Use-by / Best-before Date",
        "description": "Best before duration or expiry date for consumable / perishable goods where commodity may become unfit for human consumption.",
        "statutory_source": "Legal Metrology (Packaged Commodities) Rules 2011, Rule 6(1)(d) Proviso",
        "version": PROTOTYPE_RULESET_VERSION,
        "effective_from": "2011-04-01",
        "effective_until": None,
        "default_severity": "High",
        "applicable_modes": ["physical_package", "ecommerce_listing"]
    },
    "LM-06": {
        "rule_id": "LM-06",
        "rule_name": "Maximum Retail Price (MRP)",
        "description": "Retail sale price of the package in standard format '₹ XX.XX (incl. of all taxes)' or 'MRP Rs. XX (inclusive of all taxes)'.",
        "statutory_source": "Legal Metrology (Packaged Commodities) Rules 2011, Rule 6(1)(e)",
        "version": PROTOTYPE_RULESET_VERSION,
        "effective_from": "2011-04-01",
        "effective_until": None,
        "default_severity": "Critical",
        "applicable_modes": ["physical_package", "ecommerce_listing"]
    },
    "LM-07": {
        "rule_id": "LM-07",
        "rule_name": "Unit Sale Price (USP)",
        "description": "Unit sale price mandatory on packages containing more than 100g or 100ml declared as '₹ X.XX per g / per kg / per ml / per l'.",
        "statutory_source": "Legal Metrology (Packaged Commodities) Amendment Rules 2021, Rule 6(1)(e) Proviso",
        "version": PROTOTYPE_RULESET_VERSION,
        "effective_from": "2022-12-01",
        "effective_until": None,
        "default_severity": "Medium",
        "applicable_modes": ["physical_package", "ecommerce_listing"]
    },
    "LM-08": {
        "rule_id": "LM-08",
        "rule_name": "Consumer Care Details",
        "description": "Name, address, telephone number, and email address of grievance redressal officer / consumer care cell.",
        "statutory_source": "Legal Metrology (Packaged Commodities) Rules 2011, Rule 6(1)(n)",
        "version": PROTOTYPE_RULESET_VERSION,
        "effective_from": "2011-04-01",
        "effective_until": None,
        "default_severity": "High",
        "applicable_modes": ["physical_package", "ecommerce_listing"]
    },
    "LM-09": {
        "rule_id": "LM-09",
        "rule_name": "Country of Origin for Imported Products",
        "description": "Name of country of origin or manufacture mandatory for all imported packaged commodities on physical package.",
        "statutory_source": "Legal Metrology (Packaged Commodities) Rules 2011, Rule 6(1)(f)",
        "version": PROTOTYPE_RULESET_VERSION,
        "effective_from": "2011-04-01",
        "effective_until": None,
        "default_severity": "Medium",
        "applicable_modes": ["physical_package"]
    },
    "LM-10": {
        "rule_id": "LM-10",
        "rule_name": "Importer Name & Address for Imported Products",
        "description": "Name and complete address of the registered importer in India for imported packaged goods.",
        "statutory_source": "Legal Metrology (Packaged Commodities) Rules 2011, Rule 6(1)(a) Proviso for Imported Goods",
        "version": PROTOTYPE_RULESET_VERSION,
        "effective_from": "2011-04-01",
        "effective_until": None,
        "default_severity": "High",
        "applicable_modes": ["physical_package", "ecommerce_listing"]
    },
    "LM-11": {
        "rule_id": "LM-11",
        "rule_name": "E-commerce Country-of-Origin & Digital Mandatory Declaration",
        "description": "Mandatory digital disclosure of Country of Origin and statutory declarations on e-commerce product display pages.",
        "statutory_source": "Legal Metrology (Packaged Commodities) Amendment Rules 2017, Rule 6(10)",
        "version": PROTOTYPE_RULESET_VERSION,
        "effective_from": "2018-01-01",
        "effective_until": None,
        "default_severity": "High",
        "applicable_modes": ["ecommerce_listing"]
    }
}
