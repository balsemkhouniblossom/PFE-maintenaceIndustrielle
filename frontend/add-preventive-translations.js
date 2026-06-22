const fs = require('fs');
const path = require('path');

const preventiveTranslations = {
  en: {
    "preventiveTaskChecklist": {
      "title": "Preventive Task Checklist",
      "heading": "Preventive Maintenance Tasks",
      "description": "Coordinated preventive maintenance task checklist from maintenance plans",
      "totalTasks": "Total Tasks",
      "completedTasks": "Completed Tasks",
      "pendingTasks": "Pending Tasks",
      "taskStatus": "Task Status",
      "table": {
        "planId": "Plan ID",
        "machine": "Machine",
        "module": "Module",
        "maintenanceType": "Maintenance Type",
        "frequency": "Frequency",
        "instruction": "Instruction",
        "responsable": "Responsible",
        "status": "Status"
      },
      "empty": {
        "default": "No preventive maintenance tasks available",
        "search": "No preventive tasks match your search"
      },
      "modal": {
        "taskDetails": "Task Details",
        "markComplete": "Mark as Complete"
      },
      "form": {
        "selectMachine": "Select Machine",
        "selectModule": "Select Module",
        "taskName": "Task Name",
        "instruction": "Instruction",
        "notes": "Notes"
      },
      "placeholders": {
        "selectMachine": "Choose a machine...",
        "selectModule": "Choose a module...",
        "taskName": "Enter task name",
        "notes": "Add notes..."
      },
      "actions": {
        "complete": "Mark Complete",
        "edit": "Edit",
        "delete": "Delete",
        "view": "View Details",
        "filter": "Filter Tasks"
      },
      "status": {
        "pending": "Pending",
        "completed": "Completed",
        "overdue": "Overdue"
      },
      "notifications": {
        "loadFailed": "Failed to load preventive tasks",
        "taskMarkedComplete": "Task marked as complete",
        "taskUpdated": "Task updated successfully",
        "taskDeleted": "Task deleted successfully",
        "noTasksAvailable": "No preventive maintenance tasks available. Please create maintenance plans first.",
        "confirmMarkComplete": "Are you sure you want to mark this task as complete?"
      },
      "filters": {
        "all": "All Tasks",
        "pending": "Pending Only",
        "completed": "Completed Only",
        "overdue": "Overdue Tasks"
      }
    }
  },
  fr: {
    "preventiveTaskChecklist": {
      "title": "Liste de contrôle des tâches préventives",
      "heading": "Tâches de maintenance préventive",
      "description": "Liste de contrôle des tâches de maintenance préventive coordonnée à partir des plans de maintenance",
      "totalTasks": "Nombre total de tâches",
      "completedTasks": "Tâches complétées",
      "pendingTasks": "Tâches en attente",
      "taskStatus": "État de la tâche",
      "table": {
        "planId": "ID du plan",
        "machine": "Machine",
        "module": "Module",
        "maintenanceType": "Type de maintenance",
        "frequency": "Fréquence",
        "instruction": "Instruction",
        "responsable": "Responsable",
        "status": "État"
      },
      "empty": {
        "default": "Aucune tâche de maintenance préventive disponible",
        "search": "Aucune tâche préventive ne correspond à votre recherche"
      },
      "modal": {
        "taskDetails": "Détails de la tâche",
        "markComplete": "Marquer comme complète"
      },
      "form": {
        "selectMachine": "Sélectionner une machine",
        "selectModule": "Sélectionner un module",
        "taskName": "Nom de la tâche",
        "instruction": "Instruction",
        "notes": "Notes"
      },
      "placeholders": {
        "selectMachine": "Choisir une machine...",
        "selectModule": "Choisir un module...",
        "taskName": "Entrer le nom de la tâche",
        "notes": "Ajouter des notes..."
      },
      "actions": {
        "complete": "Marquer comme complète",
        "edit": "Modifier",
        "delete": "Supprimer",
        "view": "Voir les détails",
        "filter": "Filtrer les tâches"
      },
      "status": {
        "pending": "En attente",
        "completed": "Complétée",
        "overdue": "En retard"
      },
      "notifications": {
        "loadFailed": "Erreur lors du chargement des tâches préventives",
        "taskMarkedComplete": "Tâche marquée comme complète",
        "taskUpdated": "Tâche mise à jour avec succès",
        "taskDeleted": "Tâche supprimée avec succès",
        "noTasksAvailable": "Aucune tâche de maintenance préventive disponible. Veuillez d'abord créer des plans de maintenance.",
        "confirmMarkComplete": "Êtes-vous sûr de vouloir marquer cette tâche comme complète ?"
      },
      "filters": {
        "all": "Toutes les tâches",
        "pending": "En attente seulement",
        "completed": "Complétées seulement",
        "overdue": "Tâches en retard"
      }
    }
  }
};

const locales = ['de', 'es', 'it'];

locales.forEach((locale) => {
  const filePath = path.join(__dirname, 'messages', `${locale}.json`);
  
  if (fs.existsSync(filePath)) {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (!content.preventiveTaskChecklist) {
      // Copy from another language as base
      if (locale === 'de') {
        content.preventiveTaskChecklist = {
          "title": "Checkliste für vorbeugende Aufgaben",
          "heading": "Vorbeugende Wartungsaufgaben",
          "description": "Checkliste für koordinierte vorbeugende Wartungsaufgaben aus Wartungsplänen",
          "totalTasks": "Gesamtaufgaben",
          "completedTasks": "Abgeschlossene Aufgaben",
          "pendingTasks": "Ausstehende Aufgaben",
          "taskStatus": "Aufgabenstatus",
          "table": {
            "planId": "Plan-ID",
            "machine": "Maschine",
            "module": "Modul",
            "maintenanceType": "Wartungstyp",
            "frequency": "Häufigkeit",
            "instruction": "Anleitung",
            "responsable": "Verantwortlich",
            "status": "Status"
          },
          "empty": {
            "default": "Keine vorbeugenden Wartungsaufgaben verfügbar",
            "search": "Keine vorbeugenden Aufgaben entsprechen Ihrer Suche"
          },
          "modal": {
            "taskDetails": "Aufgabendetails",
            "markComplete": "Als abgeschlossen markieren"
          },
          "form": {
            "selectMachine": "Maschine auswählen",
            "selectModule": "Modul auswählen",
            "taskName": "Aufgabenname",
            "instruction": "Anleitung",
            "notes": "Notizen"
          },
          "placeholders": {
            "selectMachine": "Maschine wählen...",
            "selectModule": "Modul wählen...",
            "taskName": "Aufgabennamen eingeben",
            "notes": "Notizen hinzufügen..."
          },
          "actions": {
            "complete": "Als abgeschlossen markieren",
            "edit": "Bearbeiten",
            "delete": "Löschen",
            "view": "Details anzeigen",
            "filter": "Aufgaben filtern"
          },
          "status": {
            "pending": "Ausstehend",
            "completed": "Abgeschlossen",
            "overdue": "Überfällig"
          },
          "notifications": {
            "loadFailed": "Fehler beim Laden der vorbeugenden Aufgaben",
            "taskMarkedComplete": "Aufgabe als abgeschlossen markiert",
            "taskUpdated": "Aufgabe erfolgreich aktualisiert",
            "taskDeleted": "Aufgabe erfolgreich gelöscht",
            "noTasksAvailable": "Keine vorbeugenden Wartungsaufgaben verfügbar. Bitte erstellen Sie zuerst Wartungspläne.",
            "confirmMarkComplete": "Sind Sie sicher, dass Sie diese Aufgabe als abgeschlossen markieren möchten?"
          },
          "filters": {
            "all": "Alle Aufgaben",
            "pending": "Nur ausstehend",
            "completed": "Nur abgeschlossen",
            "overdue": "Überfällige Aufgaben"
          }
        };
      } else if (locale === 'es') {
        content.preventiveTaskChecklist = {
          "title": "Lista de verificación de tareas preventivas",
          "heading": "Tareas de mantenimiento preventivo",
          "description": "Lista de verificación de tareas de mantenimiento preventivo coordinada de planes de mantenimiento",
          "totalTasks": "Total de tareas",
          "completedTasks": "Tareas completadas",
          "pendingTasks": "Tareas pendientes",
          "taskStatus": "Estado de tarea",
          "table": {
            "planId": "ID de plan",
            "machine": "Máquina",
            "module": "Módulo",
            "maintenanceType": "Tipo de mantenimiento",
            "frequency": "Frecuencia",
            "instruction": "Instrucción",
            "responsable": "Responsable",
            "status": "Estado"
          },
          "empty": {
            "default": "No hay tareas de mantenimiento preventivo disponibles",
            "search": "Ninguna tarea preventiva coincide con su búsqueda"
          },
          "modal": {
            "taskDetails": "Detalles de tarea",
            "markComplete": "Marcar como completo"
          },
          "form": {
            "selectMachine": "Seleccionar máquina",
            "selectModule": "Seleccionar módulo",
            "taskName": "Nombre de tarea",
            "instruction": "Instrucción",
            "notes": "Notas"
          },
          "placeholders": {
            "selectMachine": "Elegir una máquina...",
            "selectModule": "Elegir un módulo...",
            "taskName": "Ingrese el nombre de la tarea",
            "notes": "Agregar notas..."
          },
          "actions": {
            "complete": "Marcar como completo",
            "edit": "Editar",
            "delete": "Eliminar",
            "view": "Ver detalles",
            "filter": "Filtrar tareas"
          },
          "status": {
            "pending": "Pendiente",
            "completed": "Completado",
            "overdue": "Vencido"
          },
          "notifications": {
            "loadFailed": "Error al cargar tareas preventivas",
            "taskMarkedComplete": "Tarea marcada como completa",
            "taskUpdated": "Tarea actualizada exitosamente",
            "taskDeleted": "Tarea eliminada exitosamente",
            "noTasksAvailable": "No hay tareas de mantenimiento preventivo disponibles. Por favor, cree planes de mantenimiento primero.",
            "confirmMarkComplete": "¿Está seguro de que desea marcar esta tarea como completa?"
          },
          "filters": {
            "all": "Todas las tareas",
            "pending": "Solo pendientes",
            "completed": "Solo completadas",
            "overdue": "Tareas vencidas"
          }
        };
      } else if (locale === 'it') {
        content.preventiveTaskChecklist = {
          "title": "Elenco di controllo attività preventive",
          "heading": "Attività di manutenzione preventiva",
          "description": "Elenco di controllo delle attività di manutenzione preventiva coordinato dai piani di manutenzione",
          "totalTasks": "Numero totale attività",
          "completedTasks": "Attività completate",
          "pendingTasks": "Attività in sospeso",
          "taskStatus": "Stato attività",
          "table": {
            "planId": "ID piano",
            "machine": "Macchina",
            "module": "Modulo",
            "maintenanceType": "Tipo di manutenzione",
            "frequency": "Frequenza",
            "instruction": "Istruzione",
            "responsable": "Responsabile",
            "status": "Stato"
          },
          "empty": {
            "default": "Nessuna attività di manutenzione preventiva disponibile",
            "search": "Nessuna attività preventiva corrisponde alla ricerca"
          },
          "modal": {
            "taskDetails": "Dettagli attività",
            "markComplete": "Segna come completo"
          },
          "form": {
            "selectMachine": "Seleziona macchina",
            "selectModule": "Seleziona modulo",
            "taskName": "Nome attività",
            "instruction": "Istruzione",
            "notes": "Note"
          },
          "placeholders": {
            "selectMachine": "Scegli una macchina...",
            "selectModule": "Scegli un modulo...",
            "taskName": "Inserisci nome attività",
            "notes": "Aggiungi note..."
          },
          "actions": {
            "complete": "Segna come completo",
            "edit": "Modifica",
            "delete": "Elimina",
            "view": "Visualizza dettagli",
            "filter": "Filtra attività"
          },
          "status": {
            "pending": "In sospeso",
            "completed": "Completato",
            "overdue": "Scaduto"
          },
          "notifications": {
            "loadFailed": "Errore nel caricamento delle attività preventive",
            "taskMarkedComplete": "Attività segnata come completata",
            "taskUpdated": "Attività aggiornata con successo",
            "taskDeleted": "Attività eliminata con successo",
            "noTasksAvailable": "Nessuna attività di manutenzione preventiva disponibile. Crea prima i piani di manutenzione.",
            "confirmMarkComplete": "Sei sicuro di voler segnare questa attività come completata?"
          },
          "filters": {
            "all": "Tutte le attività",
            "pending": "Solo in sospeso",
            "completed": "Solo completate",
            "overdue": "Attività scadute"
          }
        };
      }
      
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
      console.log(`✓ Added preventiveTaskChecklist to ${locale}.json`);
    } else {
      console.log(`✓ preventiveTaskChecklist already exists in ${locale}.json`);
    }
  } else {
    console.log(`✗ File not found: ${filePath}`);
  }
});

console.log('\nDone!');
