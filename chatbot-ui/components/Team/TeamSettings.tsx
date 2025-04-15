'use client';

import TeamsTable from '@/components/Team/TeamsTable';
import { useState } from 'react';
import { Team } from '@/app/server_actions/getTeams';
import { useDialog } from '@/components/Global/Dialog';
import { useTranslation } from '@/app/i18n/client';
import CreateTeamForm from '@/components/Team/CreateTeamForm';
import TeamDetail from '@/components/Team/TeamDetail';
import { useServerState } from '@/components/Provider/ServerStateProvider';
import FormButton from '@/components/Global/FormButton';

type CurrentView =
  | {
      name: 'teams-table';
    }
  | {
      name: 'add-team';
    }
  | {
      name: 'team-detail';
      team: Team;
    };

const TeamSettings = () => {
  const { t } = useTranslation('settings');

  const { teams } = useServerState();

  const dialog = useDialog();

  const [currentView, setCurrentView] = useState<CurrentView>({
    name: 'teams-table',
  });

  const showTeamsTable = () => {
    setCurrentView({ name: 'teams-table' });
  };

  const onClose = () => {
    dialog.close();
    showTeamsTable();
  };

  return (
    <div className="min-w-[70vw] bg-chatbot-900 p-6">
      <div className="flex items-start">
        <div className="w-full">
          <h1 className="mb-8 text-base font-semibold leading-5 text-neutral-100">
            {t('Settings')}
          </h1>
          {currentView.name === 'teams-table' && (
            <div className="w-full">
              <h2 className="mb-2 text-base font-semibold leading-5 text-neutral-300">
                {t('Manage teams')}
              </h2>

              <TeamsTable
                teams={teams}
                onViewDetailClick={(team) =>
                  setCurrentView({ name: 'team-detail', team })
                }
              />

              <div className="p-2 text-right">
                <FormButton
                  type="button"
                  variant="primary"
                  onClick={() => setCurrentView({ name: 'add-team' })}
                >
                  {t('Add team')}
                </FormButton>
                <FormButton type="button" onClick={onClose} className="ml-4">
                  {t('Close')}
                </FormButton>
              </div>
            </div>
          )}

          {currentView.name === 'add-team' && (
            <div className="w-full">
              <h2 className="mb-4 text-base font-semibold leading-5 text-neutral-300">
                {t('Add team')}
              </h2>

              <CreateTeamForm
                onSubmit={showTeamsTable}
                onCancel={showTeamsTable}
              />
            </div>
          )}

          {currentView.name === 'team-detail' && (
            <div className="w-full">
              <TeamDetail
                team={currentView.team}
                onDelete={showTeamsTable}
                onCancel={showTeamsTable}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamSettings;
