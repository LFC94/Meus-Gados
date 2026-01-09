// import { FileSystem } from "expo";
import * as FS from "expo-file-system";

const UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
const FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";
const FOLDER_NAME = "Meus Gados Backup";

export const googleDriveService = {
  /**
   * Procura pela pasta de backup no Google Drive.
   * Se não existir, cria.
   */
  async getOrCreateBackupFolder(accessToken: string): Promise<string> {
    // 1. Procurar pasta
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='${FOLDER_NAME}' and mimeType='${FOLDER_MIME_TYPE}' and trashed=false&fields=files(id)`;

    const response = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) throw new Error("Failed to search folder");

    const data = await response.json();

    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }

    // 2. Criar pasta se não existir
    const createResponse = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: FOLDER_NAME,
        mimeType: FOLDER_MIME_TYPE,
      }),
    });

    if (!createResponse.ok) throw new Error("Failed to create folder");

    const createData = await createResponse.json();
    return createData.id;
  },

  /**
   * Faz upload de um arquivo JSON (conteúdo do backup) para a pasta especificada.
   */
  async uploadBackup(accessToken: string, folderId: string, backupJson: string): Promise<string> {
    const filename = `backup_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;

    // Create multipart body
    const metadata = {
      name: filename,
      parents: [folderId],
      mimeType: "application/json",
    };

    const formData = new FormData();
    formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    formData.append("file", new Blob([backupJson], { type: "application/json" }));

    const response = await fetch(UPLOAD_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      // Fallback for React Native if FormData/Blob interactions fail (common issue)
      // Using simple upload if multipart fails or implementing raw body construction
      console.error("Multipart upload might have failed", await response.text());
      throw new Error("Failed to upload backup");
    }

    const data = await response.json();
    return data.id;
  },

  /**
   * Upload usando FileSystem do Expo para maior confiabilidade com arquivos grandes ou binários
   * Contorna problemas de Blob/FormData no RN antigo, mas requer que o arquivo seja salvo localmente.
   */
  async uploadBackupFromFile(accessToken: string, folderId: string, filePath: string): Promise<string> {
    // Para simplificar, vamos usar upload simples de texto já que nossos backups são JSONs puros
    // Se precisar de multipart complexo, teríamos que construir o body manualmente como string

    const fileContent = await FS.readAsStringAsync(filePath);
    return this.uploadBackup(accessToken, folderId, fileContent);
  },
};
