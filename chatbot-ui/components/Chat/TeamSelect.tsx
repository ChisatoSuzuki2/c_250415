'use client';

import { useTranslation } from '@/app/i18n/client';
import { Team } from '@/app/server_actions/getTeams';
import { ChangeEvent, FC, useEffect } from 'react';
import {
  useAppState,
  useAppStateDispatch,
} from '@/components/Provider/AppStateContextProvider';

type Props = {
  teams: Team[];
};

const TeamSelect: FC<Props> = ({ teams }) => {
  const { t } = useTranslation('chat');
  const dispatch = useAppStateDispatch();

  const { conversations, selectedConversationId } = useAppState();
  const conversation = conversations.find(
    (c) => c.id === selectedConversationId,
  );

  const onTeamChange = (e: ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'teamSelected', teamId: e.target.value });
  };

  useEffect(() => {
    const team = teams.find((t) => t.id === conversation?.teamId);

    if (teams.length > 0 && !team)
      dispatch({ type: 'teamSelected', teamId: teams[0].id });
  }, [teams, dispatch, conversation?.teamId]);

  return (
    <div className="flex items-center">
      <label className="w-3/12 text-neutral-300">{t('Select team')}</label>
      <div className="w-9/12 rounded-lg border border-chatbot-700 bg-transparent pr-2 text-white">
        <select
          className="w-full bg-transparent p-2 text-neutral-300"
          placeholder={t('Select a team') || ''}
          value={conversation?.teamId || ''}
          onChange={onTeamChange}
        >
          {teams.map((team) => (
            <option
              key={team.id}
              value={team.id}
              className="bg-chatbot-900 text-white"
            >
              {team.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TeamSelect;
