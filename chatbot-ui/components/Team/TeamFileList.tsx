import FormButton from '@/components/Global/FormButton';
import {
  IconDeviceFloppy,
  IconEdit,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { ChangeEvent, FC, MouseEvent, useState } from 'react';
import { File } from '@/app/server_actions/getFiles';
import { updateFile } from '@/app/server_actions/updateFile';
import { deleteFile } from '@/app/server_actions/deleteFile';
import { useTranslation } from '@/app/i18n/client';
import { usePagination } from '@/app/hooks/usePagination';
import toast from 'react-hot-toast';

type Prop = {
  teamId: string;
  files: File[];
  reload: () => void;
};

const TeamFileList: FC<Prop> = ({ teamId, files, reload }) => {
  const { t } = useTranslation('team');

  const {
    currentEntries: currentFiles,
    isFirstPage,
    isLastPage,
    currentPage,
    totalPage,
    moveToFirstPage,
    moveToPreviousPage,
    moveToNextPage,
    moveToLastPage,
    setPerPage,
    perPageList,
  } = usePagination(files);

  const [editFileIndex, setEditFileIndex] = useState<number | null>(null);

  const [url, setUrl] = useState<string>('');

  const onEditClick = (fileIndex: number) => {
    setUrl(files[fileIndex].url);
    setEditFileIndex(fileIndex);
  };

  const onEditSaveClick = async (file: File) => {
    try {
      const { type, detail } = await updateFile(file.team_id, file.id, url);

      if (type === 'success') {
        setUrl('');
        setEditFileIndex(null);
        reload();
      } else {
        console.error(t('An error occurred on the backend. Please contact the administrator.') + `: ${detail}`)
        toast.error(t('An error occurred on the backend. Please contact the administrator.') + `: ${detail}`)
      }
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

  const onEditCancelClick = () => {
    setEditFileIndex(null);
  };

  const onDeleteClick = async (file: File) => {
    if (confirm(t<string>('Are you sure to delete the file?'))) {
      try {
        await deleteFile(teamId, file.id);
        reload();
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
    }
  };

  const onClickFirstPage = (e: MouseEvent) => {
    e.preventDefault();

    moveToFirstPage();
  };

  const onClickPrev = (e: MouseEvent) => {
    e.preventDefault();

    moveToPreviousPage();
  };

  const onClickNext = (e: MouseEvent) => {
    e.preventDefault();

    moveToNextPage();
  };

  const onClickLastPage = (e: MouseEvent) => {
    e.preventDefault();

    moveToLastPage();
  };

  const onChangePerPage = (e: ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();

    const newPerPage = Number.parseInt(e.target.value);
    if (Number.isNaN(newPerPage)) return;
    setPerPage(newPerPage);
  };

  return (
    <>
      {currentFiles.map((file, i) => (
        <tr key={i}>
          <td className="w-full px-2 py-4">{file.filename}</td>
          <td className="whitespace-nowrap px-2 py-4">
            {editFileIndex === i ? (
              <>
                <input
                  className="mr-12 flex-1 overflow-hidden overflow-ellipsis border-neutral-400 bg-transparent text-left text-[12.5px] leading-3 text-white outline-none focus:border-neutral-100"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  autoFocus
                />
              </>
            ) : (
              file.url
            )}
          </td>
          <td className="whitespace-nowrap px-2 py-4 text-right">
            {file.chunk_size}
          </td>
          <td className="whitespace-nowrap px-2 py-4 text-center">
            {t(file.status)}
          </td>
          <td className="whitespace-nowrap text-right">
            {(file.status === 'done' || file.status === 'error') && (
              <>
                {editFileIndex === i ? (
                  <>
                    <FormButton
                      type="button"
                      variant="primary"
                      className="rounded-r-none p-2 text-sm"
                      onClick={() => onEditSaveClick(file)}
                    >
                      <IconDeviceFloppy size={16} />
                    </FormButton>
                    <FormButton
                      type="button"
                      className="rounded-l-none p-2 text-sm"
                      onClick={() => onEditCancelClick()}
                    >
                      <IconX size={16} />
                    </FormButton>
                  </>
                ) : (
                  <FormButton
                    type="button"
                    className="p-2 text-sm"
                    onClick={() => onEditClick(i)}
                  >
                    <IconEdit size={16} />
                  </FormButton>
                )}
                <FormButton
                  type="button"
                  variant="danger"
                  className="ml-2 p-2 text-sm"
                  onClick={() => onDeleteClick(file)}
                >
                  <IconTrash size={16} />
                </FormButton>
              </>
            )}
          </td>
        </tr>
      ))}
      <tr>
        <td colSpan={5} className="py-4">
          <div className="flex w-full justify-between">
            <div>
              <span className="mx-1">{t('Per page:')}</span>
              <select
                className="ml-1 rounded-md border border-chatbot-800 bg-chatbot-800 px-2 py-1 text-neutral-300"
                name="per-page"
                id="per-page"
                onChange={onChangePerPage}
              >
                {perPageList.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FormButton
                type="button"
                size="small"
                onClick={onClickFirstPage}
                disabled={isFirstPage}
                className="mr-1"
              >
                &lt;&lt;
              </FormButton>
              <FormButton
                type="button"
                size="small"
                onClick={onClickPrev}
                disabled={isFirstPage}
                className="mr-1"
              >
                &lt;
              </FormButton>
              <span className="px-2">
                {t('Page')}: {currentPage + 1} / {totalPage}
              </span>
              <FormButton
                type="button"
                size="small"
                onClick={onClickNext}
                disabled={isLastPage}
                className="ml-1"
              >
                &gt;
              </FormButton>
              <FormButton
                type="button"
                size="small"
                onClick={onClickLastPage}
                disabled={isLastPage}
                className="ml-1"
              >
                &gt;&gt;
              </FormButton>
            </div>
          </div>
        </td>
      </tr>
    </>
  );
};

export default TeamFileList;
