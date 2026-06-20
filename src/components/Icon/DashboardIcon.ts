import { defineComponent, h } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const iconMap: Record<string, string> = {
  'ep:refresh': 'Refresh',
  'ep:tickets': 'Tickets',
  'ep:circle-close': 'CircleClose',
  'ep:check': 'Check',
  'ep:arrow-right': 'ArrowRight',
  'ep:star': 'Star',
  'ep:trophy': 'Trophy',
  'ep:medal': 'Medal',
  'ep:flame': 'Flame',
  'ep:sunrise': 'Sunrise',
  'ep:calendar': 'Calendar',
  'ep:clock': 'Clock',
  'ep:circle-check': 'CircleCheck',
  'ep:warning-filled': 'WarningFilled',
  'ep:info-filled': 'InfoFilled',
}

export default defineComponent({
  name: 'Icon',
  props: {
    icon: { type: String, default: '' },
    color: { type: String, default: '' },
    size: { type: Number, default: 16 },
  },
  setup(props) {
    return () => {
      const iconName = props.icon || ''
      const mappedName = iconMap[iconName] || iconName.replace('ep:', '')
      const iconComponent = (ElementPlusIconsVue as any)[mappedName]
      if (iconComponent) {
        return h(iconComponent, {
          style: {
            color: props.color || undefined,
            fontSize: props.size + 'px',
          }
        })
      }
      return h('span', {
        class: 'iconify',
        'data-icon': iconName,
        style: {
          fontSize: props.size + 'px',
          color: props.color || undefined,
        }
      })
    }
  }
})
