'use client';

import { useTranslation } from '@/app/i18n/client';
import { FC } from 'react';
import { Team } from '@/app/server_actions/getTeams';
import FormButton from '@/components/Global/FormButton';
import { useServerState } from '@/components/Provider/ServerStateProvider';

type Props = {
  onCancel: () => void;
  team: Team;
};

const TeamTable: FC<Props> = ({ onCancel, team }) => {
  const { t } = useTranslation('team');

  const { authenticationEnabled } = useServerState();

  return (
    <>
      <h2 className="mb-4 text-base font-semibold leading-5 text-neutral-300">
        {t('Team detail')}
      </h2>
      <table className="w-full text-neutral-300">
        <tbody>
          <tr>
            <th className="w-3/12 border-r border-r-chatbot-700">
              {t('Team ID')}
            </th>
            <td className="py-2 pl-4">{team.id}</td>
          </tr>
          <tr>
            <th className="w-3/12 border-r border-r-chatbot-700">
              {t('Team name')}
            </th>
            <td className="py-2 pl-4">{team.name}</td>
          </tr>
          <tr>
            <th className="w-3/12 border-r border-r-chatbot-700">
              {t('Embedding model')}
            </th>
            <td className="py-2 pl-4">{team.embedding_model}</td>
          </tr>
          {authenticationEnabled && (
            <tr>
              <th className="w-3/12 border-r border-r-chatbot-700">
                {t("Owner's email")}
              </th>
              <td className="py-2 pl-4">{team.owner_email}</td>
            </tr>
          )}
        </tbody>
      </table>

      {authenticationEnabled && (
        <>
          <h3 className="mb-4 mt-6 text-base font-semibold text-neutral-300">
            {t('Requirements for participation')}
          </h3>
          <table className="w-full text-neutral-300">
            <tbody>
              <tr>
                <th className="w-3/12 border-r border-r-chatbot-700 py-2">
                  {t('Country')}
                </th>
                <td className="py-2 pl-4">
                  {team.country_regex || (
                    <span className="text-neutral-400">
                      {t('[No condition]')}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <th className="w-3/12 border-r border-r-chatbot-700 py-2">
                  {t('Company')}
                </th>
                <td className="py-2 pl-4">
                  {team.company_regex || (
                    <span className="text-neutral-400">
                      {t('[No condition]')}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <th className="w-3/12 border-r border-r-chatbot-700 py-2">
                  {t('Department')}
                </th>
                <td className="py-2 pl-4">
                  {team.department_regex || (
                    <span className="text-neutral-400">
                      {t('[No condition]')}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <th className="w-3/12 border-r border-r-chatbot-700 py-2">
                  {t('Title')}
                </th>
                <td className="py-2 pl-4">
                  {team.title_regex || (
                    <span className="text-neutral-400">
                      {t('[No condition]')}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <th className="w-3/12 border-r border-r-chatbot-700 py-2">
                  {t('Email')}
                </th>
                <td className="py-2 pl-4">
                  {team.email_regex || (
                    <span className="text-neutral-400">
                      {t('[No condition]')}
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      <div className="mt-4 flex items-center justify-end gap-5">
        <FormButton type="button" onClick={onCancel}>
          {t('Back')}
        </FormButton>
      </div>
    </>
  );
};

export default TeamTable;
