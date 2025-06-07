// src/utils/importExportUtils.ts
import { CredentialEntry } from "../models/Credential";

export interface ExportCredential {
  website: string;
  title?: string;
  username: string;
  password: string;
}

export interface ImportCredential extends ExportCredential {
  // Optional fields for import
}

/**
 * Export credentials to JSON format
 */
export const exportToJSON = (credentials: CredentialEntry[]): string => {
  const exportData: ExportCredential[] = credentials.map(
    ({ website, title, username, password }) => ({
      website,
      title: title || "",
      username,
      password,
    })
  );

  return JSON.stringify(exportData, null, 2);
};

/**
 * Export credentials to CSV format
 */
export const exportToCSV = (credentials: CredentialEntry[]): string => {
  const headers = ["Website", "Title", "Username", "Password"];
  const csvRows = [headers.join(",")];

  credentials.forEach(({ website, title, username, password }) => {
    const row = [
      `"${website.replace(/"/g, '""')}"`,
      `"${(title || "").replace(/"/g, '""')}"`,
      `"${username.replace(/"/g, '""')}"`,
      `"${password.replace(/"/g, '""')}"`,
    ];
    csvRows.push(row.join(","));
  });

  return csvRows.join("\n");
};

/**
 * Map field names to our standard field names
 * Supports various password manager export formats including Bitwarden, LastPass, 1Password, etc.
 */
const mapFieldName = (fieldName: string): string | null => {
  const field = fieldName.toLowerCase().trim();

  // Password mapping - check this first to avoid conflicts with login fields
  if (
    field.includes("password") ||
    field.includes("pass") ||
    field.includes("login_password") ||
    field.includes("pwd") ||
    field.includes("secret") ||
    field.includes("key") ||
    field.includes("credential") ||
    field.includes("auth")
  ) {
    return "password";
  }

  // Username mapping - covers various formats
  if (
    field.includes("username") ||
    field.includes("user") ||
    field.includes("login_username") ||
    field.includes("email") ||
    field.includes("account") ||
    field.includes("user_name") ||
    field.includes("userid") ||
    field.includes("mail") ||
    field.includes("identity") ||
    field.includes("signin") ||
    field === "login" || // Only exact match for "login" to avoid conflicts
    field.includes("id")
  ) {
    return "username";
  }
  // Website/URL mapping - covers most password managers
  if (
    field.includes("website") ||
    field.includes("site") ||
    field.includes("url") ||
    field.includes("uri") ||
    field.includes("login_uri") ||
    field.includes("domain") ||
    field.includes("host") ||
    field.includes("link") ||
    field.includes("server") ||
    field.includes("location") ||
    field.includes("address") ||
    field.includes("web") ||
    field === "uri" // Exact match for Bitwarden uri field
  ) {
    return "website";
  }

  // Title/Name mapping - covers various descriptive fields
  if (
    field.includes("title") ||
    field.includes("name") ||
    field.includes("service") ||
    field.includes("app") ||
    field.includes("application") ||
    field.includes("description") ||
    field.includes("label") ||
    field.includes("site_name") ||
    field.includes("account_name") ||
    field.includes("entry") ||
    field.includes("item") ||
    field.includes("company") ||
    field.includes("organization") ||
    field.includes("brand")
  ) {
    return "title";
  }

  // Fields to explicitly ignore (common in password manager exports but not needed)
  const ignoreFields = [
    "folder",
    "favorite",
    "type",
    "notes",
    "reprompt",
    "totp",
    "uuid",
    "id",
    "created",
    "modified",
    "last_used",
    "auto_submit",
    "never_auto_submit",
    "organization_id",
    "collection_ids",
    "revision_date",
    "creation_date",
    "deleted_date",
    "attached",
    "shared",
    "secure_note",
    "card",
    "identity",
    "fields",
  ];

  if (ignoreFields.some((ignore) => field.includes(ignore))) {
    return null;
  }

  // Return null for any other unsupported fields (they will be ignored)
  return null;
};

/**
 * Parse JSON import data with flexible field mapping
 * Supports various JSON formats including Bitwarden, direct arrays, etc.
 */
export const parseJSONImport = (jsonString: string): ImportCredential[] => {
  try {
    const data = JSON.parse(jsonString);

    let itemsToProcess: any[] = [];

    // Handle different JSON structures
    if (Array.isArray(data)) {
      // Direct array of credentials
      itemsToProcess = data;
    } else if (data.items && Array.isArray(data.items)) {
      // Bitwarden format with items array
      itemsToProcess = data.items;
    } else if (typeof data === "object" && data !== null) {
      // Single object, wrap in array
      itemsToProcess = [data];
    } else {
      throw new Error("JSON must contain credentials data");
    }

    const credentials: ImportCredential[] = [];

    itemsToProcess.forEach((item: any, index: number) => {
      const mappedCredential: Partial<ImportCredential> = {};
      let hasRequiredFields = false;

      // Handle Bitwarden structure where credentials are in a 'login' object
      let credentialData = item;
      if (item.login && typeof item.login === "object") {
        // Merge top-level fields with login fields, login takes precedence for conflicts
        credentialData = { ...item, ...item.login };

        // Handle URIs array in Bitwarden format
        if (
          item.login.uris &&
          Array.isArray(item.login.uris) &&
          item.login.uris.length > 0
        ) {
          credentialData.uri = item.login.uris[0].uri;
          credentialData.login_uri = item.login.uris[0].uri;
        }
      }

      // Map all fields from the credential data
      Object.keys(credentialData).forEach((key) => {
        const mappedField = mapFieldName(key);
        if (mappedField && credentialData[key]) {
          const value = String(credentialData[key]).trim();
          if (value) {
            mappedCredential[mappedField as keyof ImportCredential] = value;
          }
        }
      });

      // Check if we have the minimum required fields
      if (
        mappedCredential.website &&
        mappedCredential.username &&
        mappedCredential.password
      ) {
        hasRequiredFields = true;
      }

      // If we don't have website but have other URL-like fields, try to use them
      if (
        !mappedCredential.website &&
        mappedCredential.username &&
        mappedCredential.password
      ) {
        // Look for any field that might contain a URL
        for (const [key, value] of Object.entries(credentialData)) {
          const strValue = String(value).trim();
          if (
            strValue &&
            (strValue.includes("http") ||
              strValue.includes("www.") ||
              strValue.includes(".com"))
          ) {
            mappedCredential.website = strValue;
            hasRequiredFields = true;
            break;
          }
        }
      }

      // Use a fallback website if we still don't have one but have other required fields
      if (
        !mappedCredential.website &&
        mappedCredential.username &&
        mappedCredential.password
      ) {
        // Try to use title or name as website
        if (mappedCredential.title) {
          mappedCredential.website = mappedCredential.title;
          hasRequiredFields = true;
        } else {
          // Use a generic placeholder
          mappedCredential.website = `Imported Account ${index + 1}`;
          hasRequiredFields = true;
        }
      }

      if (hasRequiredFields) {
        credentials.push({
          website: mappedCredential.website!,
          title: mappedCredential.title || "",
          username: mappedCredential.username!,
          password: mappedCredential.password!,
        });
      }
    });
    if (credentials.length === 0) {
      throw new Error(
        "No valid credentials found in JSON. The file should contain credentials with fields that map to:\n" +
          "• Website/URL: website, site, url, uri, login_uri, domain, etc.\n" +
          "• Username: username, user, login, email, account, etc.\n" +
          "• Password: password, pass, login_password, pwd, etc.\n\n" +
          "Supported formats: Bitwarden exports (with items/login structure), direct credential arrays, and single objects.\n" +
          "Make sure your JSON has at least username and password fields. Website fields will be auto-generated if missing."
      );
    }

    return credentials;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Invalid JSON format");
    }
    throw error;
  }
};

/**
 * Parse CSV import data with flexible field mapping
 */
export const parseCSVImport = (csvString: string): ImportCredential[] => {
  const lines = csvString.trim().split("\n");

  if (lines.length < 2) {
    throw new Error("CSV must contain at least a header row and one data row");
  }

  // Parse CSV with basic quote handling
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i += 2;
        } else {
          // Toggle quotes
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current);
        current = "";
        i++;
      } else {
        current += char;
        i++;
      }
    }

    result.push(current);
    return result;
  };
  const headers = parseCSVLine(lines[0]);

  // Map headers to our field names
  const fieldMapping: { [index: number]: string } = {};
  headers.forEach((header, index) => {
    const mappedField = mapFieldName(header);
    if (mappedField) {
      fieldMapping[index] = mappedField;
    }
  });

  // Check if we have any mappable fields
  const mappedFields = Object.values(fieldMapping);
  if (
    !mappedFields.includes("username") ||
    !mappedFields.includes("password")
  ) {
    const availableFields = headers.join(", ");
    throw new Error(
      `CSV must contain columns for username and password. Found columns: ${availableFields}\n\n` +
        "Supported field names:\n" +
        "• Username: username, user, login, email, account, identity, etc.\n" +
        "• Password: password, pass, login_password, pwd, credential, etc.\n" +
        "• Website (optional): website, site, url, uri, domain, host, etc."
    );
  }

  const credentials: ImportCredential[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);

    // Skip empty lines
    if (values.every((val) => !val.trim())) {
      continue;
    }

    const mappedCredential: Partial<ImportCredential> = {};

    // Map values according to field mapping
    values.forEach((value, index) => {
      const fieldName = fieldMapping[index];
      if (fieldName && value.trim()) {
        // Remove quotes if present
        const cleanValue = value.replace(/^["']|["']$/g, "").trim();
        if (cleanValue) {
          mappedCredential[fieldName as keyof ImportCredential] = cleanValue;
        }
      }
    });

    // Check if we have required fields
    let hasRequiredFields = false;
    if (mappedCredential.username && mappedCredential.password) {
      hasRequiredFields = true;

      // If no website, try to find one from the values
      if (!mappedCredential.website) {
        // Look for URL-like values in any field
        for (let j = 0; j < values.length; j++) {
          const value = values[j].replace(/^["']|["']$/g, "").trim();
          if (
            value &&
            (value.includes("http") ||
              value.includes("www.") ||
              value.includes(".com") ||
              value.includes(".org") ||
              value.includes(".net") ||
              value.includes(".edu"))
          ) {
            mappedCredential.website = value;
            break;
          }
        }
      }

      // If still no website, use title or create a placeholder
      if (!mappedCredential.website) {
        if (mappedCredential.title) {
          mappedCredential.website = mappedCredential.title;
        } else {
          // Try to find any non-empty value that's not username or password
          for (let j = 0; j < values.length; j++) {
            const fieldName = fieldMapping[j];
            const value = values[j].replace(/^["']|["']$/g, "").trim();
            if (
              value &&
              fieldName !== "username" &&
              fieldName !== "password" &&
              !value.toLowerCase().includes("folder") &&
              !value.toLowerCase().includes("favorite") &&
              !value.toLowerCase().includes("type") &&
              !value.toLowerCase().includes("notes") &&
              !value.toLowerCase().includes("reprompt") &&
              !value.toLowerCase().includes("totp")
            ) {
              mappedCredential.website = value;
              break;
            }
          }

          // Last resort: use a generic placeholder
          if (!mappedCredential.website) {
            mappedCredential.website = `Imported Account ${i}`;
          }
        }
      }
    }

    if (
      hasRequiredFields &&
      mappedCredential.website &&
      mappedCredential.username &&
      mappedCredential.password
    ) {
      credentials.push({
        website: mappedCredential.website,
        title: mappedCredential.title || "",
        username: mappedCredential.username,
        password: mappedCredential.password,
      });
    }
  }
  if (credentials.length === 0) {
    throw new Error(
      "No valid credentials found in CSV. Make sure your file has:\n" +
        "• At least one row with username and password data\n" +
        "• Column headers that can be mapped to our supported field names\n" +
        "• Properly formatted CSV (comma-separated, optionally quoted)\n\n" +
        "Website fields are optional - we'll create them automatically if missing."
    );
  }

  return credentials;
};

/**
 * Download a file with the given content
 */
export const downloadFile = (
  content: string,
  filename: string,
  mimeType: string
) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/**
 * Read a file and return its content
 */
export const readFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
};
