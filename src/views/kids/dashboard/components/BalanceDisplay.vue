<template>
  <div class="balance-card">
    <div class="balance-label">{{ label }}</div>
    <div class="balance-value">
      <span class="amount" ref="amountRef">{{ displayAmount }}</span>
      <span class="unit">{{ unit }}</span>
    </div>
    <div class="balance-change">
      <span class="income">+{{ todayIncome }}</span>
      <span class="expense">-{{ todayExpense }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'

defineOptions({ name: 'BalanceDisplay' })

const props = withDefaults(
  defineProps<{
    amount: number
    label?: string
    unit?: string
    todayIncome?: number
    todayExpense?: number
  }>(),
  {
    amount: 0,
    label: '积分余额',
    unit: '积分',
    todayIncome: 0,
    todayExpense: 0
  }
)

const displayAmount = ref(0)
const amountRef = ref<HTMLElement>()

const animateNumber = (target: number) => {
  const duration = 1500
  const start = displayAmount.value
  const startTime = performance.now()

  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeOut = 1 - Math.pow(1 - progress, 3)
    displayAmount.value = Math.floor(start + (target - start) * easeOut)

    if (progress < 1) {
      requestAnimationFrame(step)
    }
  }

  requestAnimationFrame(step)
}

watch(
  () => props.amount,
  (newVal) => {
    animateNumber(newVal)
  }
)

onMounted(() => {
  animateNumber(props.amount)
})
</script>

<style lang="scss" scoped>
.balance-card {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 20px;
  padding: 24px;
  color: #fff;
  text-align: center;
  box-shadow: 0 8px 32px rgba(245, 87, 108, 0.3);
}

.balance-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.balance-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;

  .amount {
    font-size: 48px;
    font-weight: 700;
    line-height: 1;
  }

  .unit {
    font-size: 16px;
    opacity: 0.9;
  }
}

.balance-change {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 12px;
  font-size: 14px;

  .income {
    &::before {
      content: '+';
    }
  }

  .expense {
    &::before {
      content: '-';
    }
  }
}
</style>
