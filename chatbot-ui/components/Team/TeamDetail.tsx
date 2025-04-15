import { FC, useCallback, useEffect, useState } from 'react';
import EditTeamForm from '@/components/Team/EditTeamForm';
import { Team } from '@/app/server_actions/getTeams';
import { useTranslation } from '@/app/i18n/client';
import { useServerAction } from '@/app/hooks/useServerAction';
import { getFiles } from '@/app/server_actions/getFiles';
import { Spinner } from '@/components/Global/Spinner';
import TeamFileUploader from '@/components/Team/TeamFileUploader';
import TeamFileList from '@/components/Team/TeamFileList';
import { useServerState } from '@/components/Provider/ServerStateProvider';
import FormButton from '@/components/Global/FormButton';

type Props = {
  team: Team;
  onDelete: () => void;
  onCancel: () => void;
};

type Tab = 'files' | 'team';

type FileView = 'list' | 'upload';

const TeamDetail: FC<Props> = ({ team, onDelete, onCancel }) => {
  const { t } = useTranslation('team');

  const { embeddings } = useServerState();
  const embedding = embeddings.find((e) => e.model_id === team.embedding_model);

  const {
    data: filesResult,
    error,
    isLoading,
    isPending,
    reload,
  } = useServerAction(useCallback(() => getFiles(team.id), [team.id]));

  useEffect(() => {
    let timer: number | null = null;

    if (!isLoading) {
      if (filesResult?.type === 'success') {
        const processing = filesResult.files.filter(
          (f) => f.status !== 'done' && f.status !== 'error',
        );
        if (processing.length > 0) {
          timer = window.setTimeout(reload, 2000);
        }
      } else if (error != null) {
        timer = window.setTimeout(reload, 2000);
      }
    }

    return () => {
      timer && clearTimeout(timer);
    };
  }, [filesResult, error, isLoading, reload]);

  const [tab, setTab] = useState<Tab>('files');

  const [fileView, setFileView] = useState<FileView>('list');

  if (filesResult && filesResult.type === 'not-found') {
    return (
      <>
        <div className="flex">
          <div className="flex-1">{t('This team was deleted.')}</div>
          <button
            className="rounded-md border border-chatbot-800 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-800"
            onClick={onCancel}
          >
            {t('Back')}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="w-full flex-col">
        <div className="flex">
          <div
            className={`rounded-t-md px-4 py-2 ${
              tab === 'files'
                ? 'bg-chatbot-950'
                : 'cursor-pointer text-neutral-400 hover:text-neutral-300'
            }`}
            onClick={() => setTab('files')}
          >
            {t('Files')}
          </div>
          <div
            className={`rounded-t-md px-4 py-2 ${
              tab === 'team'
                ? 'bg-chatbot-950'
                : 'cursor-pointer text-neutral-400 hover:text-neutral-300'
            }`}
            onClick={() => setTab('team')}
          >
            {t('Team')}
          </div>
        </div>

        <div
          className={`flex-1 rounded-md bg-chatbot-950 px-4 py-2 shadow-md ${
            tab === 'files' && 'rounded-tl-none'
          }`}
        >
          {tab === 'files' && (
            <div>
              {fileView === 'list' && (
                <>
                  <table className="mb-4 w-full text-neutral-300">
                    <thead>
                      <tr className="border-b border-chatbot-700">
                        <td className="px-2 py-4">{t('File name')}</td>
                        <td className="whitespace-nowrap px-2 py-4">
                          {t('URL')}
                        </td>
                        <td className="whitespace-nowrap px-2 py-4">
                          {t('Chunk size')}
                        </td>
                        <td className="whitespace-nowrap px-2 py-4">
                          {t('Status')}
                        </td>
                        <td className="px-2 py-4"></td>
                      </tr>
                    </thead>
                    <tbody>
                      {isPending && (
                        <>
                          <tr>
                            <td colSpan={4} className="py-4 text-center">
                              <Spinner className="inline-block" />
                            </td>
                          </tr>
                        </>
                      )}

                      {filesResult &&
                        filesResult.type === 'success' &&
                        filesResult.files.length === 0 && (
                          <tr>
                            <td
                              colSpan={4}
                              className="py-4 text-center text-neutral-500"
                            >
                              {t('No file uploaded.')}
                            </td>
                          </tr>
                        )}

                      {filesResult && filesResult.type === 'success' && (
                        <TeamFileList
                          teamId={team.id}
                          files={filesResult.files}
                          reload={reload}
                        />
                      )}
                    </tbody>
                  </table>

                  <div className="flex">
                    <div className="ml-2 flex-1 text-neutral-400">
                      {embedding == null && (
                        <div className="mt-2 text-rose-400">
                          {t(
                            'Embedding ID "{{model}}" is not deployed. File upload is disabled.',
                            { model: team.embedding_model },
                          )}
                        </div>
                      )}
                    </div>

                    <FormButton
                      variant="primary"
                      onClick={() => setFileView('upload')}
                      disabled={embedding == null}
                    >
                      {t('Add file')}
                    </FormButton>

                    <button
                      className="ml-4 rounded-md border border-chatbot-800 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-800"
                      onClick={onCancel}
                    >
                      {t('Cancel')}
                    </button>
                  </div>
                </>
              )}

              {fileView === 'upload' && (
                <>
                  <TeamFileUploader
                    teamId={team.id}
                    onAllUploadCompleted={reload}
                    onCancel={() => setFileView('list')}
                  />
                </>
              )}
            </div>
          )}

          {tab === 'team' && (
            <div>
              <EditTeamForm
                team={team}
                onDelete={onDelete}
                onCancel={onCancel}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TeamDetail;
