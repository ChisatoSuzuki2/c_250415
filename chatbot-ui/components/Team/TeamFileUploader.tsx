import { useTranslation } from '@/app/i18n/client';
import React, { ChangeEvent, DragEvent, FC, useRef, useState } from 'react';
import { uploadFile } from '@/app/server_actions/uploadFile';
import {
  IconAlertTriangle,
  IconChecks,
  IconFile,
  IconFileCheck,
} from '@tabler/icons-react';
import Tooltip from '@/components/Global/Tooltip';
import { Spinner } from '@/components/Global/Spinner';
import FormButton from '@/components/Global/FormButton';
import { useServerState } from '@/components/Provider/ServerStateProvider';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

type Props = {
  teamId: string;
  onAllUploadCompleted: () => void;
  onCancel: () => void;
};

const SI_PREFIXES = ['B', 'KB', 'MB', 'GB'];

const ACCEPTABLE_EXTENSIONS = [
  '.csv',
  '.txt',
  '.htm',
  '.html',
  '.docx',
  '.xlsx',
  '.pptx',
  '.pdf',
];

const humanReadableSize = (size: number): string => {
  let hSize = size;
  let metricPrefix = 0;

  while (hSize > 1000 && metricPrefix < SI_PREFIXES.length) {
    hSize /= 1000;
    metricPrefix++;
  }

  return `${hSize.toFixed(2)} ${SI_PREFIXES[metricPrefix]}`;
};

type UploadStatus =
  | 'init'
  | 'uploading'
  | 'uploaded'
  | 'conflict'
  | 'extension-not-supported'
  | 'error'
  | 'file-size-exceeds';

type UploadFile = {
  file: File;
  status: UploadStatus;
  name: string;
  url: string;
  chunk_size: number;
};

const STATUS_MAP: { [status: string]: UploadStatus } = {
  success: 'uploaded',
  conflict: 'conflict',
  'extension-not-supported': 'extension-not-supported',
  'bad-request': 'error'
};

const TeamFileUploader: FC<Props> = ({
  teamId,
  onAllUploadCompleted,
  onCancel,
}) => {
  const { t } = useTranslation('team');

  const { uploadFileSizeLimitMB } = useServerState();

  const [files, setFiles] = useState<UploadFile[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onSelectFileClick = () => {
    const fileInput = fileInputRef.current;
    if (fileInput == null) return;

    fileInput.click();
  };

  const onUploadClick = async () => {
    let updatedFiles = files.map((f) =>
      f.status === 'file-size-exceeds'
        ? f
        : {
            ...f,
            status: 'uploading' as UploadStatus,
          },
    );
    setFiles(updatedFiles);

    try {
      for (const [i, file] of files.entries()) {
        if (file.status === 'file-size-exceeds') continue;

        const formData = new FormData();
        formData.append('file', file.file);
        formData.append(
          'metadata',
          JSON.stringify({
            filename: file.file.name,
            name: file.name,
            url: file.url,
            chunk_size: file.chunk_size,
          }),
        );

        const { type, detail } = await uploadFile(teamId, formData);
        if (detail.length > 0) {
          console.error(t('An error occurred on the backend. Please contact the administrator.') + `: ${detail}`)
          toast.error(t('An error occurred on the backend. Please contact the administrator.') + `: ${detail}`)
        }

        const status: UploadStatus = STATUS_MAP[type] || 'error';

        updatedFiles = updatedFiles.map((f, j) =>
          i === j ? { ...f, status } : f,
        );
        setFiles(updatedFiles);
      }

      onAllUploadCompleted();
    } catch (err) {
      if (err instanceof Error) {
        console.error(t('An error occurred in the frontend processing. Please contact the administrator.') + err);
        toast.error(t('An error occurred in the frontend processing. Please contact the administrator.') + err);
      } else {
        console.error(t('An unexpected error occurred. Please contact the administrator.'));
        console.error(err)
        toast.error(t('An unexpected error occurred. Please contact the administrator.'))
      }
    }
   
  };

  const addFiles = (fileList: FileList) => {
    const existingFileNames = files.map((file) => file.file.name);
    const newFiles = Array.from(fileList)
      .filter(
        (newFile) =>
          ACCEPTABLE_EXTENSIONS.some((ext) => newFile.name.endsWith(ext)) &&
          !existingFileNames.includes(newFile.name),
      )
      .map((newFile) => ({
        file: newFile,
        status:
          newFile.size > uploadFileSizeLimitMB * 1024 * 1024
            ? ('file-size-exceeds' as const)
            : ('init' as const),
        name: '',
        url: '',
        chunk_size: 500,
      }));

    setFiles([...files, ...newFiles]);
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files == null) return;

    addFiles(e.target.files);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    addFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onURLChange = (e: ChangeEvent<HTMLInputElement>, fileIndex: number) => {
    setFiles(
      files.map((f, i) => {
        if (i === fileIndex)
          return {
            ...f,
            url: e.target.value,
          };
        else return f;
      }),
    );
  };

  const onChunkSizeChange = (
    e: ChangeEvent<HTMLInputElement>,
    fileIndex: number,
  ) => {
    setFiles(
      files.map((f, i) => {
        if (i === fileIndex)
          return {
            ...f,
            chunk_size: Number.parseInt(e.target.value) || 1,
          };
        else return f;
      }),
    );
  };

  return (
    <>
      <div onDrop={onDrop} onDragOver={onDragOver}>
        <input
          className="hidden"
          type="file"
          accept={ACCEPTABLE_EXTENSIONS.join(',')}
          multiple
          ref={fileInputRef}
          onChange={onFileInputChange}
        />

        {files.length === 0 && (
          <>
            <div className="mx-auto my-8 w-fit text-neutral-500">
              <div>
                {t(
                  'Add files by clicking "Select files" or dropping files in this area to upload files.',
                )}
              </div>
              <div className="mt-2">
                <b>{t('Limitations')}</b>:
                <ul className="w-fit list-disc">
                  <li>
                    {t(
                      'Encrypted docx, xlsx, pptx, etc. are not supported. Please decrypt the file before uploading.',
                    )}
                  </li>
                  <li>
                    {t(
                      'UTF-8 is the only supported character set for HTML, CSV, and plain text.',
                    )}
                  </li>
                </ul>
              </div>
            </div>
          </>
        )}

        {files.length > 0 && (
          <div className="mb-4 w-full text-neutral-300">
            {files.map((file, i) => (
              <div
                key={i}
                className="grid border-b border-dashed border-chatbot-700"
              >
                <div style={{ gridArea: '1/1' }}>
                  <div
                    className={clsx([
                      'flex w-full',
                      file.status === 'file-size-exceeds' && 'text-neutral-400',
                    ])}
                  >
                    <div className="flex-1 px-2 pt-4">{file.file.name}</div>

                    <div className="whitespace-nowrap px-2 pt-4">
                      {humanReadableSize(file.file.size)}
                    </div>

                    <div className="px-2 pt-4">
                      {file.status === 'init' && (
                        <IconFile className="text-neutral-400" size={18} />
                      )}
                      {file.status === 'uploaded' && (
                        <IconFileCheck className="text-emerald-400" size={18} />
                      )}
                      {file.status === 'conflict' && (
                        <>
                          <IconChecks
                            className="mr-2 inline-block text-emerald-400 transition group-hover:text-emerald-500"
                            size={18}
                          />
                          {t('File was already uploaded.')}
                        </>
                      )}
                      {file.status === 'extension-not-supported' && (
                        <>
                          <Tooltip
                            position="left"
                            tooltipContent={
                              <>
                                {t('The specified extension is not supported.')}
                              </>
                            }
                          >
                            <IconAlertTriangle
                              className="text-rose-500 transition group-hover:text-rose-600"
                              size={18}
                            />
                          </Tooltip>
                        </>
                      )}
                      {file.status === 'error' && (
                        <>
                          <Tooltip
                            position="left"
                            tooltipContent={<>{t('Uploading file failed.')}</>}
                          >
                            <IconAlertTriangle
                              className="text-rose-500 transition group-hover:text-rose-600"
                              size={18}
                            />
                          </Tooltip>
                        </>
                      )}
                      {file.status === 'file-size-exceeds' && (
                        <>
                          <Tooltip
                            position="left"
                            tooltipContent={
                              <>
                                {t(
                                  'File size exceeds the limit {{limit}} MB.',
                                  {
                                    limit: uploadFileSizeLimitMB,
                                  },
                                )}
                              </>
                            }
                          >
                            <IconAlertTriangle
                              className="text-rose-500 transition group-hover:text-rose-600"
                              size={18}
                            />
                          </Tooltip>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="my-4 w-full">
                    <div className="flex w-full items-center">
                      <div className="mx-2 w-2/12">
                        <Tooltip
                          tooltipContent={
                            <>
                              {t(
                                'You can specify URL from which the file was downloaded.',
                              )}
                            </>
                          }
                          position="right"
                        >
                          {t('URL')}
                        </Tooltip>
                      </div>
                      <div className="mx-2 flex-grow">
                        <input
                          type="text"
                          className="w-full rounded-md border-2 border-transparent bg-chatbot-800 p-2 outline-none focus:border-chatbot-600 disabled:bg-chatbot-900 disabled:text-neutral-500"
                          value={file.url}
                          onChange={(e) => onURLChange(e, i)}
                          disabled={
                            file.status === 'uploaded' ||
                            file.status === 'conflict' ||
                            file.status === 'file-size-exceeds'
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-2 flex w-full items-center">
                      <div className="mx-2 w-2/12">
                        <Tooltip
                          tooltipContent={
                            <>
                              {t(
                                "Set the smaller chunk size than the embedding model's limit size.",
                              )}
                            </>
                          }
                          position="right"
                        >
                          {t('Chunk size')}
                        </Tooltip>
                      </div>

                      <div className="mx-2 flex-grow">
                        <input
                          type="number"
                          className="w-full rounded-md border-2 border-transparent bg-chatbot-800 p-2 outline-none focus:border-chatbot-600 disabled:bg-chatbot-900 disabled:text-neutral-500"
                          value={file.chunk_size}
                          onChange={(e) => onChunkSizeChange(e, i)}
                          disabled={
                            file.status === 'uploaded' ||
                            file.status === 'conflict' ||
                            file.status === 'file-size-exceeds'
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`h-full w-full rounded-md ${
                    file.status === 'uploading'
                      ? 'grid place-items-center bg-neutral-950 bg-opacity-50'
                      : 'hidden'
                  }`}
                  style={{ gridArea: '1/1' }}
                >
                  <Spinner className="inline-block" size="24" />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-right">
          <FormButton type="button" onClick={onSelectFileClick}>
            {t('Select file')}
          </FormButton>

          <FormButton
            type="button"
            variant="primary"
            onClick={onUploadClick}
            disabled={
              files.filter((f) => f.status !== 'file-size-exceeds').length === 0
            }
            className="ml-4"
          >
            {t('Upload')}
          </FormButton>

          <FormButton type="button" onClick={onCancel} className="ml-4">
            {t('Cancel')}
          </FormButton>
        </div>
      </div>
    </>
  );
};

export default TeamFileUploader;
