<?php

namespace Justoverclock\UsersMapLocation\Listeners;

use Flarum\User\Event\Saving;
use Illuminate\Support\Arr;

class SaveLocationToDatabase
{
    public function handle(Saving $event)
    {
        $user = $event->user;
        $data = $event->data;
        $actor = $event->actor;

        $isSelf = $actor->id === $user->id;
        $canEdit = $actor->can('edit', $user);
        $attributes = Arr::get($data, 'attributes', []);

        if (isset($attributes['location_countrycode'])) {
            if (!$isSelf) {
                $actor->assertPermission($canEdit);
            }
            $user->location_city = $attributes['location_city'];
            $user->location_postcode = $attributes['location_postcode'];
            $user->location_countrycode = $attributes['location_countrycode'];
            $user->location_country = $attributes['location_country'];
            $user->location_latitude = $attributes['location_latitude'];
            $user->location_longitude = $attributes['location_longitude'];
        }
    }
}
