
export const parseBoolean = (value: string | null | undefined,
                             defaultValue: boolean): boolean => {
  if (value === null || value === undefined) {
    return defaultValue;
  }

  const trueValues = ['true', 'yes', '1'];
  const falseValues = ['false', 'no', '0'];

  const lowerValue = value.toLowerCase();

  if (trueValues.includes(lowerValue)) {
    return true;
  } else if (falseValues.includes(lowerValue)) {
    return false;
  } else {
    throw new Error(`Invalid boolean value: ${value}`);
  }
};

export const parseEnvironment = () => {
  const next_runtime = process.env.NEXT_RUNTIME;
  const chatbot_ui_app_base_path = process.env.CHATBOT_UI_APP_BASE_PATH || ''
  const chatbot_ui_enable_authentication_str =
    process.env.CHATBOT_UI_ENABLE_AUTHENTICATION;
  const chatbot_ui_max_log_files = process.env.CHATBOT_UI_MAX_LOG_FILES;
  const keycloak_issuer = process.env.KEYCLOAK_ISSUER;
  const keycloak_client_id = process.env.KEYCLOAK_CLIENT_ID;
  const keycloak_secret = process.env.KEYCLOAK_SECRET;
  const nextauth_url = process.env.NEXTAUTH_URL
  const document_source = process.env.DOCUMENT_SOURCE || 'source'
  const document_url = process.env.DOCUMENT_URL || 'esre__url'
  const chatbot_ui_upload_file_size_limit_mb_str = process.env.CHATBOT_UI_UPLOAD_FILE_SIZE_LIMIT_MB || '100';
  const langchain_api_host = process.env.LANGCHAIN_API_HOST;
  const session_token_name = process.env.SESSION_TOKEN_NAME || '__Secure-next-auth.session-token';
  const session_path = process.env.SESSION_PATH || '/';

  const errors = []

  let chatbot_ui_enable_authentication = false;
  try {
    chatbot_ui_enable_authentication =
      parseBoolean(chatbot_ui_enable_authentication_str, false)
  } catch {
    errors.push(`Error parse ${chatbot_ui_enable_authentication_str} as boolean`)
  }

  let chatbot_ui_upload_file_size_limit_mb = 0;
  try {
    chatbot_ui_upload_file_size_limit_mb = parseInt(chatbot_ui_upload_file_size_limit_mb_str)
  } catch {
    errors.push(`Error parse ${chatbot_ui_upload_file_size_limit_mb} as number`)
  }

  if (!langchain_api_host) errors.push('LANGCHAIN_API_HOST is required.');

  if (errors.length > 0) {
    throw new Error(`${errors.length} error. ${errors.join(", ")}`)
  }

  return {
    next_runtime,
    chatbot_ui_app_base_path,
    chatbot_ui_enable_authentication,
    chatbot_ui_max_log_files,
    keycloak_issuer,
    keycloak_client_id,
    keycloak_secret,
    nextauth_url,
    document_source,
    document_url,
    chatbot_ui_upload_file_size_limit_mb,
    langchain_api_host,
    session_token_name,
    session_path
  }
};

export const envConfigures = parseEnvironment()
