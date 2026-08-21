const fs = require('fs');
const blueprint = JSON.parse(fs.readFileSync('firebase-blueprint.json', 'utf8'));

blueprint.entities["QuoteRequest"] = {
  "title": "QuoteRequest",
  "description": "Customer contact and quote requests",
  "type": "object",
  "properties": {
    "fullName": { "type": "string" },
    "email": { "type": "string" },
    "phone": { "type": "string" },
    "commodity": { "type": "string" },
    "volume": { "type": "string" },
    "origin": { "type": "string" },
    "destination": { "type": "string" },
    "service": { "type": "string" },
    "otherRequirements": { "type": "string" },
    "status": { "type": "string", "enum": ["new", "contacted", "resolved", "archived"] },
    "createdAt": { "type": "string" },
    "updatedAt": { "type": "string" }
  },
  "required": ["fullName", "email", "phone", "service", "status", "createdAt"]
};

blueprint.firestore["quotes"] = {
  "schema": { "$ref": "QuoteRequest" },
  "description": "Collection of quote requests submitted by customers"
};

fs.writeFileSync('firebase-blueprint.json', JSON.stringify(blueprint, null, 2));
console.log('Blueprint updated');
