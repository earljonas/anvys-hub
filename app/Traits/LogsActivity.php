<?php

namespace App\Traits;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

trait LogsActivity
{
    protected static function bootLogsActivity()
    {
        static::created(function ($model) {
            $model->logActivity('created', null, $model->getAttributes());
        });

        static::updated(function ($model) {
            $model->logActivity('updated', $model->getOriginal(), $model->getChanges());
        });

        static::deleted(function ($model) {
            $model->logActivity('deleted', $model->getOriginal(), null);
        });
    }

    protected function logActivity($action, $oldValues = null, $newValues = null)
    {
        // Don't log if there are no actual changes (like saving without updating any fields)
        if ($action === 'updated' && empty($newValues)) {
            return;
        }

        // Hide passwords or hidden fields from logs if they exist
        if ($oldValues) {
            $oldValues = array_diff_key($oldValues, array_flip($this->getHidden()));
        }
        if ($newValues) {
            $newValues = array_diff_key($newValues, array_flip($this->getHidden()));
        }

        ActivityLog::create([
            'user_id' => Auth::id(), // Can be null if command line/system job
            'action' => $action,
            'subject_type' => get_class($this),
            'subject_id' => $this->id,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => Request::ip(),
        ]);
    }
}
