---
tags: [ai-agents, claude-code, moc, study-guide]
aliases: [AI Agents, Работа с AI-агентами]
---

# Работа с AI-агентами — Map of Content

## Цель

Научиться управлять coding agent как проверяемым инженерным процессом: давать ровно нужный контекст, отделять инструкции от принудительных ограничений, планировать вертикальными срезами и завершать изменение наблюдаемым доказательством, а не сообщением агента «готово».

## Пререквизиты

- Умение читать diff и пользоваться Git на уровне рабочей ветки и коммита.
- Понимание unit-, integration- и end-to-end-проверок.
- Любой небольшой репозиторий, в котором можно безопасно провести учебную сессию.
- Для командных примеров нужен установленный Claude Code; общие принципы применимы и к другим coding agents.

## Маршрут зависимостей

1. **Контекст.** [[claude-code-engineering-workflow#1. Контекст и ментальная модель|Контекст и ментальная модель]].  
   **Проверка:** объясните, что загружается между сессиями, чем `/clear` отличается от `/compact` и почему нельзя опираться на фиксированный процент «умной зоны».
2. **Инструменты.** [[claude-code-engineering-workflow#2. Инструменты и границы полномочий|CLI, interactive commands, permission modes и checkpoints]].  
   **Проверка:** продолжите последнюю сессию, откройте `/context`, войдите в Plan mode и назовите изменения, которые checkpointing не сможет откатить.
3. **Steering.** [[claude-code-engineering-workflow#3. Steering: инструкция не равна ограничению|CLAUDE.md, rules, permissions и hooks]].  
   **Проверка:** разложите пять проектных правил между `CLAUDE.md`, `.claude/rules/`, skill, test и permission/hook без дублирования.
4. **Skills.** [[claude-code-engineering-workflow#4. Skills и progressive disclosure|Skills и progressive disclosure]].  
   **Проверка:** спроектируйте frontmatter skill так, чтобы его можно было вызвать только вручную, а подробный reference загружался лишь при необходимости.
5. **Планирование.** [[claude-code-engineering-workflow#5. Планирование и выполнение|Требования, tracer bullet и Plan → Execute → Verify → Clear]].  
   **Проверка:** превратите горизонтальный план «сначала весь backend, затем весь UI» в минимальный наблюдаемый end-to-end-срез.
6. **Feedback loops.** [[claude-code-engineering-workflow#6. Feedback loops|Детерминированная обратная связь]].  
   **Проверка:** для одной ошибки укажите самый быстрый сигнал, который её обнаружит, и реальный запуск, который подтвердит исправление.
7. **Тестирование.** [[claude-code-engineering-workflow#7. Тестирование с агентом|Red → Green → Refactor и границы тестов]].  
   **Проверка:** сформулируйте тест, который падает на правдоподобной поломке контракта, и отдельно ручной smoke-check того же пользовательского пути.
8. **Архитектура.** [[claude-code-engineering-workflow#8. Архитектура: deep modules|Deep modules и устойчивые интерфейсы]].  
   **Проверка:** найдите shallow boundary, предложите меньший интерфейс и назовите тестируемый контракт, не привязанный к внутренней реализации.

## Практика

- [[exercises|Упражнения]] — retrieval, diagnosis, модификация prompt/workflow и перенос подхода на другой проект.

## Связанные темы

- [[../04-architecture/MOC|Архитектура ПО]]
- [[../07-craftsmanship/MOC|Инженерное мастерство]]
- [[../09-practice/MOC|Практика]]

## Источники

Версионно чувствительные утверждения в основной заметке сверены **2026-07-18** с первичной документацией:

- [Claude Code: CLI reference](https://code.claude.com/docs/en/cli-reference)
- [Claude Code: Commands](https://code.claude.com/docs/en/commands)
- [Claude Code: Interactive mode](https://code.claude.com/docs/en/interactive-mode)
- [Claude Code: Permission modes](https://code.claude.com/docs/en/permission-modes)
- [Claude Code: Memory](https://code.claude.com/docs/en/memory)
- [Claude Code: Skills](https://code.claude.com/docs/en/skills)
- [Claude Code: Subagents](https://code.claude.com/docs/en/sub-agents)
- [Claude Code: Checkpointing](https://code.claude.com/docs/en/checkpointing)
- [Claude Code: Hooks guide](https://code.claude.com/docs/en/hooks-guide)

Полный список первичных и сохранённых дополнительных источников: [[claude-code-engineering-workflow#Источники|«Источники»]].
