import { memo, useEffect, useState } from 'react'

import { useAtomValue } from 'jotai'

import LeftPanelContainer from '@/containers/LeftPanelContainer'

import SettingItem from './SettingItem'

import { extensionManager } from '@/extension'
import { inActiveEngineProviderAtom } from '@/helpers/atoms/Extension.atom'
import { janSettingScreenAtom } from '@/helpers/atoms/Setting.atom'

const SettingLeftPanel = () => {
  const settingScreens = useAtomValue(janSettingScreenAtom)
  const inActiveEngineProvider = useAtomValue(inActiveEngineProviderAtom)

  const [extensionHasSettings, setExtensionHasSettings] = useState<
    { name?: string; setting: string }[]
  >([])

  const [engineHasSettings, setEngineHasSettings] = useState<
    { name?: string; setting: string; provider: string }[]
  >([])

  useEffect(() => {
    const getAllSettings = async () => {
      const extensionsMenu: { name?: string; setting: string }[] = []
      const engineMenu: {
        name?: string
        setting: string
        provider: string
      }[] = []
      const extensions = extensionManager.getAll()

      for (const extension of extensions) {
        const settings = await extension.getSettings()
        if (
          typeof extension.getSettings === 'function' &&
          'provider' in extension &&
          typeof extension.provider === 'string'
        ) {
          if (
            (settings && settings.length > 0) ||
            (await extension.installationState()) !== 'NotRequired'
          ) {
            engineMenu.push({
              name: extension.productName,
              setting: extension.name,
              provider:
                'provider' in extension &&
                typeof extension.provider === 'string'
                  ? extension.provider
                  : '',
            })
          }
        } else if (settings && settings.length > 0) {
          extensionsMenu.push({
            name: extension.productName,
            setting: extension.name,
          })
        }
      }

      setExtensionHasSettings(extensionsMenu)
      setEngineHasSettings(engineMenu)
    }
    getAllSettings()
  }, [])

  return (
    <LeftPanelContainer>
      <div className="flex-shrink-0 px-2 py-3">
        <div className="mb-1 px-2">
          <label className="text-xs font-medium text-[hsla(var(--text-secondary))]">
            General
          </label>
        </div>

        {settingScreens.map((settingScreen) => (
          <SettingItem
            key={settingScreen}
            name={settingScreen}
            setting={settingScreen}
          />
        ))}

        {engineHasSettings.filter(
          (x) => !inActiveEngineProvider.includes(x.provider)
        ).length > 0 && (
          <div className="mb-1 mt-4 px-2">
            <label className="text-xs font-medium text-[hsla(var(--text-secondary))]">
              Model Provider
            </label>
          </div>
        )}

        {engineHasSettings
          .sort((a, b) => a.provider.localeCompare(b.provider))
          .filter((x) => !inActiveEngineProvider.includes(x.provider))
          .map((item) => (
            <SettingItem
              key={item.name}
              name={item.name?.replace('Inference Engine', '') ?? item.setting}
              setting={item.setting}
            />
          ))}

        {extensionHasSettings.length > 0 && (
          <div className="mb-1 mt-4 px-2">
            <label className="text-xs font-medium text-[hsla(var(--text-secondary))]">
              Core Extensions
            </label>
          </div>
        )}

        {extensionHasSettings
          .sort((a, b) => String(a.name).localeCompare(String(b.name)))
          .map((item) => (
            <SettingItem
              key={item.name}
              name={item.name?.replace('Inference Engine', '') ?? item.setting}
              setting={item.setting}
            />
          ))}
      </div>
    </LeftPanelContainer>
  )
}

export default memo(SettingLeftPanel)
